/**
 * One-off script to send a test announcement email.
 * Usage: npx tsx scripts/test-email.ts
 */
import { Resend } from "resend";
import { emailHtml, emailP, emailButton } from "../src/lib/email/template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("Set RESEND_API_KEY in environment");
  process.exit(1);
}

const to = "tim.arnold@gmail.com";
const subject = "By Bitter Flame — New Version Live";

const body = emailHtml(
  emailP("Hi Tim,") +
  emailP("We've released a major update to By Bitter Flame. The game has moved to its own original rule system — still rooted in old-school dungeon crawling, but built from scratch with a folklore-inspired setting, original ancestries (Fey, Knockers, Hobs, Leshies, Revenants), and mechanics designed for solo AI-driven play. The spellcasting system now uses the Toll — a cumulative cost that makes every cast a real decision — and combat is faster and more dangerous. Character creation, leveling, and downtime activities have all been reworked to fit the new system.") +
  emailP("Beyond the rules, there are a lot of quality-of-life improvements: your Anthropic API key is now encrypted at rest, companions earn XP and carry their own gold, torch tracking is visual instead of text-based, the economy mode toggle lets you switch to a cheaper model for shopping and lighter moments, and bug reports go straight to our issue tracker from inside the game. The whole experience should feel sharper and more polished.", { muted: true }) +
  emailP('Your existing characters and adventures from the previous version are still available at <a href="https://beta1.bybitterflame.com" style="color:#d4c47a;">beta1.bybitterflame.com</a> if you\'d like to wrap up any quests in progress. Going forward, all new development will be on the main site. We\'d love to hear what you think — use the "Suggest Feature" or "Report a Bug" links in the menu any time.', { muted: true }) +
  emailButton("Start a New Adventure", "https://bybitterflame.com")
);

const resend = new Resend(RESEND_API_KEY);

async function main() {
  const { data, error } = await resend.emails.send({
    from: "By Bitter Flame <gm@bybitterflame.com>",
    to,
    subject,
    html: body,
  });

  if (error) {
    console.error("Send failed:", error);
    process.exit(1);
  }

  console.log(`Sent to ${to} — id: ${data?.id}`);
}

main();
