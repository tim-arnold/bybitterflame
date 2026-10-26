import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export async function POST(request: Request) {
  // Accounts are invite-only: they're created server-side by
  // /api/account-request/set-password. Block BetterAuth's public sign-up endpoint.
  if (new URL(request.url).pathname.endsWith("/sign-up/email")) {
    return new Response("Not found", { status: 404 });
  }
  const auth = await getAuth();
  return auth.handler(request);
}
