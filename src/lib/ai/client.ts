import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/lib/game/types";

const anthropic = new Anthropic();

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

/**
 * Stream a chat completion from Claude.
 * Calls onChunk with each text delta as it arrives.
 * Returns the full assembled response text.
 */
export async function streamChat(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void,
): Promise<string> {
  let fullText = "";

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
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

  if (finalMessage.stop_reason === "end_turn") {
    return fullText;
  }

  // If the model stopped for another reason, still return what we have
  return fullText;
}

/**
 * Create a streaming Response suitable for Next.js API routes.
 * Returns a ReadableStream that emits text chunks.
 */
export function createStreamingResponse(
  systemPrompt: string,
  messages: Message[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        await streamChat(systemPrompt, messages, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        });
        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown streaming error";
        controller.enqueue(
          encoder.encode(`\n\n[Error: ${errorMessage}]`),
        );
        controller.close();
      }
    },
  });
}
