# GA4 Event Tracking — Setup Guide

Property ID: **G-285WWGVN6Z**

## Events We Track

All events are sent via the `trackEvent()` utility in `src/lib/analytics.ts`.

| Event name | When it fires | Parameters |
|---|---|---|
| `request_access` | User submits the beta access form | — |
| `adventure_started` | User begins a new adventure | `type`: `gm_decides` \| `roll_own` \| `module` |
| `character_created` | Character creation completes (any path) | — |
| `api_key_added` | User saves their Anthropic API key | — |
| `free_turns_exhausted` | User hits the free-turn limit | — |
| `session_paused` | User clicks "End Session" | — |
| `adventure_completed` | GM emits `adventureComplete` gamestate | — |
| `character_died` | GM emits `playerDied` gamestate | — |
| `soul_transferred` | Player inherits a companion after death | — |
| `companion_joined` | An NPC companion joins the party | — |

`adventure_started.type` values:
- `gm_decides` — home page "Let the GM Decide" flow
- `roll_own` — `/create` character creation flow
- `module` — adventure detail page (specific adventure selected)

---

## Setting Up in GA4

### 1. Verify events are arriving

1. Open [analytics.google.com](https://analytics.google.com) and select the **By Torchlight** property.
2. Go to **Reports → Realtime**.
3. Trigger an event in the app (e.g. submit the access form or start an adventure).
4. You should see the event appear in the Realtime view within a few seconds.

> Events can take **24–48 hours** to appear in standard reports. Use Realtime or DebugView for immediate validation.

### 2. Mark events as Key Events (Conversions)

The most important events to mark as key events:

1. Go to **Admin → Data display → Events**.
2. Find each event in the list (they appear once they've fired at least once).
3. Toggle **Mark as key event** for the events you want to track as conversions.

Recommended key events:
- `request_access` — funnel top
- `character_created` — core activation event
- `api_key_added` — paid user activation
- `adventure_completed` — successful session

### 3. Create a Funnel Exploration

To see the conversion funnel (access request → character created → API key added):

1. Go to **Explore → Blank exploration**.
2. Set **Technique** to **Funnel exploration**.
3. Add steps:
   - Step 1: Event = `request_access`
   - Step 2: Event = `character_created`
   - Step 3: Event = `api_key_added`

### 4. Track adventure_started by type

To segment adventures by how they started:

1. Go to **Explore → Free form**.
2. Add dimension: **Event name** (filter to `adventure_started`)
3. Add dimension: **Event parameter** → `type`
4. This shows the breakdown of `gm_decides` / `roll_own` / `module` starts.

Alternatively, register `type` as a custom dimension:
1. **Admin → Data display → Custom definitions → Create custom dimension**
2. Name: `Adventure Start Type`
3. Scope: Event
4. Parameter: `type`

### 5. DebugView for development

To see events in real time during development:

1. In your browser, open the GA4 DebugView URL:
   `https://analytics.google.com/analytics/web/#/p<PROPERTY_ID>/debugview/overview`
   (replace `<PROPERTY_ID>` with the numeric ID from Admin → Property settings)
2. Add the query param `?debug_mode=1` to your localhost URL, **or** install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension.

> Note: `trackEvent` is a no-op when `window.gtag` is not defined, which is the case in development unless you're loading the real GA4 script.

---

## Adding New Events

1. Add the new event type to the `GtagEvent` union in `src/lib/analytics.ts`.
2. Call `trackEvent({ name: "your_event", ...params })` at the right location.
3. Deploy and verify in GA4 Realtime or DebugView.
4. Register any new parameters as custom dimensions in GA4 Admin if you want to filter/segment by them.
