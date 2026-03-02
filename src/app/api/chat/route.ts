import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createStreamingResponse, type SystemBlock } from "@/lib/ai/client";
import { CHARACTER_CREATION_PROMPT } from "@/lib/ai/prompts/initializer";
import { buildSessionPrompt } from "@/lib/ai/prompts/session";
import { buildAdventureCreatePrompt } from "@/lib/ai/prompts/adventure-create";
import { buildGmCreatePrompt } from "@/lib/ai/prompts/gm-create";
import { loadRules } from "@/lib/ai/rules-loader";
import { getAdventure } from "@/lib/adventures/index";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { ChatRequest, GameContext, LocationType } from "@/lib/game/types";
import { SERVER_KEY_TURN_LIMIT } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { messages, character, campaign, sessionSummaries = [], mode } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Determine which API key to use ──────────────────────────────────────
    let resolvedApiKey: string | undefined;
    let userId: string | null = null;
    let trialExhaustedUser: { name: string; email: string } | null = null;
    let incrementTurnCounter = false; // true when turn limit should tick (server key or beta trial)
    let useOwnKey = false; // true when the user's own Anthropic key is being used

    let session: Awaited<ReturnType<typeof getSession>> | null = null;
    try {
      session = await getSession(request);
    } catch {
      // Auth unavailable (e.g. no Cloudflare context in local dev) — treat as anonymous
    }

    if (session) {
      userId = session.user.id;
      try {
        const { env } = await getCloudflareContext({ async: true });
        const db = getDb(env.DB);

        const [user] = await db
          .select({
            name: users.name,
            email: users.email,
            anthropicApiKey: users.anthropicApiKey,
            betaApiKey: users.betaApiKey,
            betaKeyMode: users.betaKeyMode,
            serverKeyTurnsUsed: users.serverKeyTurnsUsed,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user?.anthropicApiKey?.startsWith("sk-ant-")) {
          // User has their own key — use it, no limit
          resolvedApiKey = user.anthropicApiKey;
          useOwnKey = true;
        } else if (user?.betaApiKey?.startsWith("sk-ant-")) {
          // Admin-assigned beta key — use it in both trial and full mode
          resolvedApiKey = user.betaApiKey;
          if (user.betaKeyMode !== "full") {
            // Trial mode: still enforce the turn limit on their beta key
            const turnsUsed = user.serverKeyTurnsUsed ?? 0;
            if (turnsUsed >= SERVER_KEY_TURN_LIMIT) {
              return new Response(
                JSON.stringify({
                  error: "api_key_required",
                  turnsUsed,
                  limit: SERVER_KEY_TURN_LIMIT,
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            if (turnsUsed + 1 >= SERVER_KEY_TURN_LIMIT && user) {
              trialExhaustedUser = { name: user.name, email: user.email };
            }
            incrementTurnCounter = true;
          }
          // Full mode: no limit, resolvedApiKey already set
        } else {
          // No key — use server key with turn limit
          const turnsUsed = user?.serverKeyTurnsUsed ?? 0;
          if (turnsUsed >= SERVER_KEY_TURN_LIMIT) {
            return new Response(
              JSON.stringify({
                error: "api_key_required",
                turnsUsed,
                limit: SERVER_KEY_TURN_LIMIT,
              }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          }
          // resolvedApiKey stays undefined → client.ts falls back to env var
          incrementTurnCounter = true;
          if (turnsUsed + 1 >= SERVER_KEY_TURN_LIMIT && user) {
            trialExhaustedUser = { name: user.name, email: user.email };
          }
        }
      } catch (dbErr) {
        console.error("DB lookup error in chat route:", dbErr);
        // Fall through — allow the request using the env key
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // Character creation turns don't count toward the trial limit
    if (mode !== "play") {
      incrementTurnCounter = false;
    }

    let systemContent: string | SystemBlock[];

    if (mode === "create") {
      // Static prompt — identical for all character creation sessions; cache the whole thing
      systemContent = [
        { type: "text", text: CHARACTER_CREATION_PROMPT, cache_control: { type: "ephemeral" } },
      ];
    } else if (mode === "adventure-create") {
      // GM-driven character creation for a specific adventure module
      const moduleId = campaign?.moduleId;
      const adventureId = campaign?.adventureId;
      const adventure = moduleId && adventureId ? getAdventure(moduleId, adventureId) : undefined;
      if (!adventure) {
        return new Response(JSON.stringify({ error: "Adventure not found" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const prompt = buildAdventureCreatePrompt(adventure);
      systemContent = [
        { type: "text", text: prompt, cache_control: { type: "ephemeral" } },
      ];
    } else if (mode === "gm-create") {
      // GM-driven character creation for a standard (non-module) campaign
      const prompt = buildGmCreatePrompt();
      systemContent = [
        { type: "text", text: prompt, cache_control: { type: "ephemeral" } },
      ];
    } else {
      // Build gameplay context from the current state
      const context: GameContext = {
        inCombat: false,
        inCharacterCreation: false,
        shopping: false,
        exploring: true,
        levelingUp: false,
        casting: false,
        locationType: campaign?.worldState?.locationType as LocationType | undefined,
      };

      // Try to infer context from recent messages
      const recentText = messages
        .slice(-3)
        .map((m) => m.content.toLowerCase())
        .join(" ");

      if (recentText.includes("attack") || recentText.includes("initiative") || recentText.includes("combat")) {
        context.inCombat = true;
      }
      if (recentText.includes("shop") || recentText.includes("buy") || recentText.includes("merchant")) {
        context.shopping = true;
      }
      if (recentText.includes("cast") || recentText.includes("spell")) {
        context.casting = true;
      }
      if (recentText.includes("level up") || recentText.includes("leveling")) {
        context.levelingUp = true;
      }
      // Auto-detect level-up from character data — load leveling rules whenever XP is at or above threshold
      if (
        character &&
        character.xp !== undefined &&
        character.level !== undefined &&
        character.xp >= character.level * 10
      ) {
        context.levelingUp = true;
      }

      const rules = loadRules(context, character?.level);

      // Load adventure data if this campaign has a module
      const moduleId = campaign?.moduleId;
      const adventureId = campaign?.adventureId;
      const adventure = moduleId && adventureId ? getAdventure(moduleId, adventureId) : undefined;

      const structured = buildSessionPrompt({
        character: character ?? {},
        campaign: campaign ?? {},
        sessionSummaries,
        rules,
        adventure,
      });

      // Assemble three-layer cached prompt:
      // Layer 1 (cache): static GM frame — identical every turn across all sessions
      // Layer 2 (cache): rules — changes only when context flags change
      // Layer 3 (no cache): dynamic state — character, world, companions, etc.
      systemContent = [
        { type: "text", text: structured.staticFrame, cache_control: { type: "ephemeral" } },
        { type: "text", text: structured.rules, cache_control: { type: "ephemeral" } },
        { type: "text", text: structured.dynamicState },
      ];
      // TEST 2b: temporary logging — remove after QA
      console.log("[QA 2b] System blocks:", (systemContent as SystemBlock[]).map(b => ({
        chars: b.text.length,
        cached: !!b.cache_control,
      })));
    }

    // Window to the last 20 messages, strip gamestate blocks (already in system prompt),
    // strip hidden field (API only accepts role + content), and ensure first message
    // is from user (Claude API requirement — windowing can otherwise cut to assistant-first).
    let windowed = messages.slice(-20);
    const firstUser = windowed.findIndex((m) => m.role === "user");
    if (firstUser > 0) windowed = windowed.slice(firstUser);

    const trimmedMessages = windowed.map((m) => ({
      role: m.role,
      content:
        m.role === "assistant"
          ? m.content.replace(/```gamestate[\s\S]*?```/g, "").trim()
          : m.content,
    }));

    const stream = createStreamingResponse(
      systemContent,
      trimmedMessages,
      resolvedApiKey,
      userId
        ? (usage) => {
            getCloudflareContext({ async: true })
              .then(async ({ env }) => {
                const db = getDb(env.DB);
                const updates: Record<string, unknown> = {
                  totalInputTokens: sql`${users.totalInputTokens} + ${usage.inputTokens}`,
                  totalOutputTokens: sql`${users.totalOutputTokens} + ${usage.outputTokens}`,
                  totalCacheWriteTokens: sql`${users.totalCacheWriteTokens} + ${usage.cacheCreationInputTokens}`,
                  totalCacheReadTokens: sql`${users.totalCacheReadTokens} + ${usage.cacheReadInputTokens}`,
                };
                // Increment turn counter for server key or beta trial users
                if (incrementTurnCounter) {
                  updates.serverKeyTurnsUsed = sql`${users.serverKeyTurnsUsed} + 1`;
                }
                // Track own-key usage separately
                if (useOwnKey) {
                  updates.ownKeyInputTokens = sql`${users.ownKeyInputTokens} + ${usage.inputTokens}`;
                  updates.ownKeyOutputTokens = sql`${users.ownKeyOutputTokens} + ${usage.outputTokens}`;
                  updates.ownKeyCacheWriteTokens = sql`${users.ownKeyCacheWriteTokens} + ${usage.cacheCreationInputTokens}`;
                  updates.ownKeyCacheReadTokens = sql`${users.ownKeyCacheReadTokens} + ${usage.cacheReadInputTokens}`;
                }
                await db.update(users).set(updates).where(eq(users.id, userId!));

                // Email admin when a trial user exhausts their turns
                if (incrementTurnCounter && trialExhaustedUser && env.RESEND_API_KEY) {
                  const { Resend } = await import("resend");
                  const resend = new Resend(env.RESEND_API_KEY);
                  const adminUrl = `${env.BETTER_AUTH_URL}/admin`;
                  await resend.emails.send({
                    from: "gm@bytorchlight.com",
                    to: "gm@bytorchlight.com",
                    subject: `Trial limit reached — ${trialExhaustedUser.name}`,
                    html: `
                      <p><strong>${trialExhaustedUser.name}</strong> (${trialExhaustedUser.email}) has used all ${SERVER_KEY_TURN_LIMIT} trial turns.</p>
                      <p><a href="${adminUrl}">Open the admin panel</a> to assign them a full beta key.</p>
                    `,
                  });
                }
              })
              .catch((err) => console.error("Failed to track token usage:", err));
          }
        : undefined,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
