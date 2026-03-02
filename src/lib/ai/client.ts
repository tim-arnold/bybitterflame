import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/lib/game/types";

const OVERLOADED_MESSAGES = [
  "*The arcane connection flickers and dies. The GM's voice fades into silence...*\n\n---\n\nThe threads of fate are stretched thin across the realm. Try again in a moment.",
  "*A tremor runs through the weave of magic. Something vast stirs, disrupting the connection...*\n\n---\n\nThe spirits are restless and cannot be reached right now. Try again shortly.",
  "*The torchlight dims as the link to the otherworld wavers and snaps...*\n\n---\n\nThe arcane channel is overwhelmed. Rest a moment, then try again.",
];

const GENERIC_ERROR_MESSAGES = [
  "*The GM's voice cuts out mid-sentence. Something has gone wrong in the ether...*\n\n---\n\nAn unknown force disrupted the connection. Try again.",
  "*Silence falls where there was once a voice. The weave has frayed...*\n\n---\n\nSomething went wrong. Try your action again.",
];

function getAtmosphericError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const isOverloaded =
    msg.toLowerCase().includes("overload") ||
    (error instanceof Object && "status" in error && (error as { status: number }).status === 529);

  const pool = isOverloaded ? OVERLOADED_MESSAGES : GENERIC_ERROR_MESSAGES;
  return "\n\n" + pool[Math.floor(Math.random() * pool.length)];
}

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

/** A cacheable system content block. */
export type SystemBlock = { type: "text"; text: string; cache_control?: { type: "ephemeral" } };

/** System prompt: either a plain string or an array of blocks with optional cache_control. */
export type SystemContent = string | SystemBlock[];

export interface StreamResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

/**
 * Stream a chat completion from Claude.
 * Calls onChunk with each text delta as it arrives.
 * Returns the full assembled response text plus token usage.
 */
export async function streamChat(
  system: SystemContent,
  messages: Message[],
  onChunk: (text: string) => void,
  apiKey?: string,
): Promise<StreamResult> {
  const anthropic = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
  let fullText = "";

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: system as string,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  stream.on("text", (text) => {
    fullText += text;
    onChunk(text);
  });

  const finalMessage = await stream.finalMessage();
  const usage = finalMessage.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };

  return {
    text: fullText,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? 0,
    cacheReadInputTokens: usage.cache_read_input_tokens ?? 0,
  };
}

export interface UsageResult {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

/**
 * Create a streaming Response suitable for Next.js API routes.
 * Returns a ReadableStream that emits text chunks.
 * onComplete is called with token usage after the stream finishes successfully.
 */
export function createStreamingResponse(
  system: SystemContent,
  messages: Message[],
  apiKey?: string,
  onComplete?: (usage: UsageResult) => void,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const result = await streamChat(system, messages, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        }, apiKey);
        // Append a sentinel for client-side session token tracking.
        // Uses \x00 prefix so it's unambiguous and won't appear in rendered text.
        controller.enqueue(encoder.encode(
          `\x00TOKENS:${JSON.stringify({
            in: result.inputTokens,
            out: result.outputTokens,
            cacheWrite: result.cacheCreationInputTokens,
            cacheRead: result.cacheReadInputTokens,
          })}`
        ));
        onComplete?.({
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cacheCreationInputTokens: result.cacheCreationInputTokens,
          cacheReadInputTokens: result.cacheReadInputTokens,
        });
        controller.close();
      } catch (error) {
        console.error("[AI client] Stream error:", error);
        controller.enqueue(encoder.encode(getAtmosphericError(error)));
        controller.close();
      }
    },
  });
}