import { NextRequest } from "next/server";
import { createStreamingResponse } from "@/lib/ai/client";
import { CHARACTER_CREATION_PROMPT } from "@/lib/ai/prompts/initializer";
import { buildSessionPrompt } from "@/lib/ai/prompts/session";
import { loadRules } from "@/lib/ai/rules-loader";
import type { ChatRequest, GameContext } from "@/lib/game/types";

export const runtime = "nodejs";

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

    let systemPrompt: string;

    if (mode === "create") {
      systemPrompt = CHARACTER_CREATION_PROMPT;
    } else {
      // Build gameplay context from the current state
      const context: GameContext = {
        inCombat: false,
        inCharacterCreation: false,
        shopping: false,
        exploring: true,
        levelingUp: false,
        casting: false,
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

      const rules = loadRules(context);

      systemPrompt = buildSessionPrompt({
        character: character ?? {},
        campaign: campaign ?? {},
        sessionSummaries: [],
        rules,
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

    const stream = createStreamingResponse(systemPrompt, trimmedMessages);

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
