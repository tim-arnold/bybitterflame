import { NextResponse } from "next/server";

/**
 * Returns a JSON error response `{ error: message }` with the given HTTP status.
 * Centralises the repeated `NextResponse.json({ error: ... }, { status: ... })` pattern
 * across all API route handlers.
 */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
