import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const JIRA_BASE_URL = "https://tim52.atlassian.net";
const JIRA_EMAIL = "tim.arnold@gmail.com";
const JIRA_PROJECT_KEY = "BTORCH";

const MAX_DESCRIPTION_LENGTH = 5000;

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Rate limit: 10 reports per hour per IP
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  try {
    const allowed = await checkRateLimit(db, `bug-report:${ip}`, { limit: 10, windowSecs: 3600 });
    if (!allowed) {
      return apiError("Too many requests", 429);
    }
  } catch {
    // Non-critical — allow through if rate limit check fails (e.g. migration not yet run)
  }

  const body = (await request.json()) as {
    userEmail?: string;
    description?: string;
    debugInfo?: Record<string, string>;
    issueType?: string;
  };

  const userEmail = (body.userEmail ?? "").trim();
  const description = (body.description ?? "").trim().slice(0, MAX_DESCRIPTION_LENGTH);
  const debugInfo = body.debugInfo ?? {};
  const issueType = body.issueType === "Story" ? "Story" : "Bug";

  if (!description) {
    return apiError("Description is required", 400);
  }

  const token = process.env.JIRA_API_TOKEN;
  const credentials = Buffer.from(`${JIRA_EMAIL}:${token}`).toString("base64");

  // Build ADF description with user text + debug info table
  const debugParagraphs = Object.entries(debugInfo).map(([k, v]) => ({
    type: "paragraph",
    content: [
      { type: "text", text: `${k}: `, marks: [{ type: "strong" }] },
      { type: "text", text: v },
    ],
  }));

  const adfDescription = {
    version: 1,
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: description }],
      },
      ...(userEmail
        ? [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Reported by: ", marks: [{ type: "strong" }] },
                { type: "text", text: userEmail },
              ],
            },
          ]
        : []),
      ...(debugParagraphs.length > 0
        ? [
            {
              type: "rule",
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Debug Info", marks: [{ type: "strong" }] }],
            },
            ...debugParagraphs,
          ]
        : []),
    ],
  };

  const summary = description.length > 80 ? description.slice(0, 77) + "..." : description;

  const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `[${issueType === "Story" ? "Feature" : "Bug"}] ${summary}`,
        description: adfDescription,
        issuetype: { name: issueType },
        labels: ["beta-feedback"],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Jira API error:", response.status, response.statusText, error);
    return apiError("Failed to create issue", 502);
  }

  const issue = (await response.json()) as { key: string };
  return NextResponse.json({ ok: true, issueKey: issue.key });
}