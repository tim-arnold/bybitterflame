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

/**
 * Stream a chat completion from Claude.
 * Calls onChunk with each text delta as it arrives.
 * Returns the full assembled response text.
 */
export async function streamChat(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void,
  apiKey?: string,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
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
  apiKey?: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        await streamChat(systemPrompt, messages, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        }, apiKey);
        controller.close();
      } catch (error) {
        console.error("[AI client] Stream error:", error);
        controller.enqueue(encoder.encode(getAtmosphericError(error)));
        controller.close();
      }
    },
  });
}
