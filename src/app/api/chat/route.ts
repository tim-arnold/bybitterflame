import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createStreamingResponse } from "@/lib/ai/client";
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

export const runtime = "nodejs";

const SERVER_KEY_TURN_LIMIT = 20;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { messages, character, campaign, mode } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Determine which API key to use ──────────────────────────────────────
    let resolvedApiKey: string | undefined;
    let userId: string | null = null;

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
          .select({ anthropicApiKey: users.anthropicApiKey, serverKeyTurnsUsed: users.serverKeyTurnsUsed })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user?.anthropicApiKey?.startsWith("sk-ant-")) {
          // User has their own key — use it, no limit
          resolvedApiKey = user.anthropicApiKey;
        } else {
          // Use server key — check turn limit
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
        }
      } catch (dbErr) {
        console.error("DB lookup error in chat route:", dbErr);
        // Fall through — allow the request using the env key
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    let systemPrompt: string;

    if (mode === "create") {
      systemPrompt = CHARACTER_CREATION_PROMPT;
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
      systemPrompt = buildAdventureCreatePrompt(adventure);
    } else if (mode === "gm-create") {
      // GM-driven character creation for a standard (non-module) campaign
      systemPrompt = buildGmCreatePrompt();
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

      systemPrompt = buildSessionPrompt({
        character: character ?? {},
        campaign: campaign ?? {},
        sessionSummaries: [],
        rules,
        adventure,
      });
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

    const stream = createStreamingResponse(systemPrompt, trimmedMessages, resolvedApiKey);

    // After streaming starts, increment serverKeyTurnsUsed (fire-and-forget)
    // Only when using the server key (resolvedApiKey is undefined = using env var)
    if (userId && !resolvedApiKey) {
      getCloudflareContext({ async: true })
        .then(({ env }) => {
          const db = getDb(env.DB);
          return db
            .update(users)
            .set({ serverKeyTurnsUsed: sql`${users.serverKeyTurnsUsed} + 1` })
            .where(eq(users.id, userId!));
        })
        .catch((err) => console.error("Failed to increment serverKeyTurnsUsed:", err));
    }

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
