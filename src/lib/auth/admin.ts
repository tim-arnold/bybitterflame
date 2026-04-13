import type { getSession } from "@/lib/auth/session";

type Session = Awaited<ReturnType<typeof getSession>>;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export function isAdmin(session: Session): boolean {
  return !!ADMIN_EMAIL && session?.user.email === ADMIN_EMAIL;
}
