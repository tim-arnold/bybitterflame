import { getAuth } from "./index";

export async function requireSession(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function getSession(request: Request) {
  const auth = await getAuth();
  return auth.api.getSession({ headers: request.headers });
}
