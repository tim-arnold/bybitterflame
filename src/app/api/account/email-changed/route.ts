import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Redirect target for the email-change verification link (see withCallbackURL
 * in lib/auth). better-auth has already updated the email and signed the user
 * in by the time it redirects here. The email is the login username, so end
 * every session and send the user to log in with the new address.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    // Invalid or expired verification link: the email was not changed.
    return Response.redirect(
      new URL(`/email-change-confirmed?error=${encodeURIComponent(error)}`, url),
      302,
    );
  }

  const auth = await getAuth();
  const reqHeaders = await headers();

  try {
    await auth.api.revokeSessions({ headers: reqHeaders });
  } catch {
    // No valid session to revoke; sign-out below still clears the cookies.
  }
  const signOutResponse = await auth.api.signOut({ headers: reqHeaders, asResponse: true });

  const response = new Response(null, {
    status: 302,
    headers: { Location: new URL("/login?emailChanged=1&redirect=%2Faccount", url).toString() },
  });
  for (const cookie of signOutResponse.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
