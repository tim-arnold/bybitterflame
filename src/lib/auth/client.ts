"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

/**
 * Sign out and do a full page load to /login. A hard navigation (not
 * router.push) is intentional: it drops cached client session state.
 */
export async function signOutAndRedirect() {
  await authClient.signOut();
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload is the point
  window.location.href = "/login";
}
