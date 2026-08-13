---
name: boma-platform
description: "Development skill for the BOMA co-living/community platform. Enforces custom Supabase abstraction layer (never call supabase-js directly), Supabase Edge Function patterns, Tailwind v4 design tokens, React + Vite component conventions, and BOMA's screen/shell architecture. Use for any feature work, bug fix, new screen, data operation, or edge function in this project."
version: 1.0.0
---

# BOMA Platform Skill

A development skill for AI coding assistants working on the BOMA React + Vite platform. BOMA is a co-living and community-building platform that matches neighbors into Pods — small groups who explore shared housing, governance agreements, and lifestyle alignment together.

This skill enforces the architectural and design rules that keep the codebase consistent, secure, and maintainable. **Every code change in this project must follow these rules.** Violations are bugs, not style preferences.

---

## Core Stack

| Layer | Technology | Version / Notes |
| --- | --- | --- |
| Framework | React | v19 (JSX, functional components only) |
| Bundler | Vite | v8, `@vitejs/plugin-react` |
| Styling | Tailwind CSS | v4 with `@tailwindcss/vite` plugin, `@theme` token block |
| Icons | Lucide React | Tree-shakeable SVG icons |
| Backend | Supabase | `@supabase/supabase-js` v2 — **abstracted, never used directly** |
| Edge Functions | Supabase Deno Functions | `supabase/functions/` directory |
| Linter | OxLint | Project-level `.oxlintrc.json` |
| Fonts | Google Fonts | Bricolage Grotesque (display), Inter (body), IBM Plex Mono (mono) |

---

## Rule 1 — Custom Supabase Abstraction (MANDATORY)

**Never call `supabase.*` methods directly inside components, screens, or hooks.** Every Supabase operation — reads, writes, updates, deletes, auth, storage, realtime — must go through a **custom wrapper function** defined in a dedicated module.

### Why

- Direct `supabase.from('table').select(...)` calls scattered across 40+ screens create unmaintainable coupling.
- A custom abstraction layer gives us one place to add error handling, logging, data normalization, caching, and retry logic.
- If we migrate off Supabase or restructure tables, we change one file — not forty.

### How — The Existing Pattern

The project already has this pattern established in [`src/auth.js`](file:///d:/Boma_react/src/auth.js). **Study it. Extend it. Never bypass it.**

```
src/
├── supabaseClient.js    ← The ONLY file that imports createClient
├── auth.js              ← Custom auth functions (customRegister, customLogin, etc.)
├── api/                 ← NEW: create this for non-auth data operations
│   ├── users.js         ← fetchUser, updateUser, deleteUser, etc.
│   ├── pods.js          ← fetchPod, createPod, updatePod, etc.
│   ├── matching.js      ← fetchMatches, runMatchingEngine, etc.
│   ├── agreements.js    ← fetchAgreements, updateAgreement, etc.
│   └── admin.js         ← admin-specific data operations
```

### Rules

1. **`supabaseClient.js` is the single import point.** Only this file may `import { createClient } from '@supabase/supabase-js'`. Every other file imports the `supabase` instance from `supabaseClient.js`.

2. **Every data operation is a named, exported async function.** The function lives in the appropriate module (`auth.js`, `api/users.js`, `api/pods.js`, etc.). The function:
   - Accepts clean JS arguments (no Supabase-specific types at the call site).
   - Calls `supabase.from(...)` or `supabase.functions.invoke(...)` internally.
   - Handles errors with `try/catch` or error-checking and throws a descriptive JS `Error`.
   - Returns plain JS objects/arrays — never raw Supabase response shapes.

3. **Components import custom functions, never `supabase`.** A component file should **never** contain `import { supabase } from '../supabaseClient'`. It should import `import { fetchPodById } from '../api/pods'` instead.

4. **Function naming convention:** `custom` prefix for auth functions (existing pattern: `customRegister`, `customLogin`, `customVerifyEmail`). For data CRUD, use verb-first names: `fetchUser`, `updatePodSettings`, `deleteAgreementDraft`, `createPodInvite`.

5. **Example — the right way vs. the wrong way:**

   ```jsx
   // ❌ WRONG — direct supabase call in a component
   import { supabase } from '../../supabaseClient';
   
   function PodDashboard({ podId }) {
     useEffect(() => {
       const { data } = await supabase.from('pods').select('*').eq('id', podId).single();
       setPod(data);
     }, []);
   }

   // ✅ RIGHT — custom function in api/pods.js, consumed by component
   // In src/api/pods.js:
   import { supabase } from '../supabaseClient';
   
   export async function fetchPodById(podId) {
     const { data, error } = await supabase
       .from('pods')
       .select('*')
       .eq('id', podId)
       .single();
     if (error) throw new Error(`Failed to fetch pod: ${error.message}`);
     return data;
   }

   // In component:
   import { fetchPodById } from '../../api/pods';
   
   function PodDashboard({ podId }) {
     useEffect(() => {
       fetchPodById(podId).then(setPod).catch(console.error);
     }, []);
   }
   ```

6. **When adding a new data operation:**
   - Check if a function already exists in `auth.js` or `api/` before creating one.
   - If the module (e.g., `api/pods.js`) doesn't exist yet, create it following the pattern above.
   - Export each function individually (named exports). No default exports for API modules.

---

## Rule 2 — Supabase Edge Functions (MANDATORY)

All server-side logic — email sending, webhook handling, third-party API calls, background processing, sensitive operations — runs as a **Supabase Edge Function** in `supabase/functions/`.

### Existing Pattern

[`supabase/functions/send-verification-email/index.ts`](file:///d:/Boma_react/supabase/functions/send-verification-email/index.ts) is the reference implementation. **Study it before creating new edge functions.**

### Rules

1. **Every edge function lives in its own directory:**
   ```
   supabase/functions/
   ├── send-verification-email/
   │   └── index.ts
   ├── run-matching-engine/       ← example new function
   │   └── index.ts
   └── send-pod-notification/     ← example new function
       └── index.ts
   ```

2. **Edge function boilerplate — CORS headers are mandatory:**
   ```ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   };

   serve(async (req) => {
     // CORS preflight — always handle first
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders });
     }

     try {
       // ... function logic ...
       return new Response(
         JSON.stringify({ success: true, data: result }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     } catch (err: any) {
       return new Response(
         JSON.stringify({ error: err.message }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
   });
   ```

3. **Secrets and env vars** live in Deno env (`Deno.env.get('KEY')`), never in client `.env` files. SMTP credentials, API keys, webhook secrets — all server-side only.

4. **Client-side invocation** always goes through a custom wrapper function (Rule 1):
   ```js
   // In src/api/notifications.js
   import { supabase } from '../supabaseClient';

   export async function sendPodNotification(podId, message) {
     const { data, error } = await supabase.functions.invoke(
       'send-pod-notification',
       { body: { podId, message } }
     );
     if (error) throw new Error(`Notification failed: ${error.message}`);
     return data;
   }
   ```

5. **Validate inputs** at the top of every edge function. Return `400` with a descriptive error for missing or invalid fields.

6. **Naming convention:** kebab-case directory names that describe the action: `send-verification-email`, `run-matching-engine`, `process-webhook`, `generate-readiness-score`.

---

## Rule 3 — Design System & Visual Language

BOMA has a defined design system. **Every UI element must use the design tokens defined in [`src/index.css`](file:///d:/Boma_react/src/index.css).** No ad-hoc hex values, no inline custom colors.

### Design Tokens (Source of Truth)

```css
@theme {
  --color-bg: #F4F7FB;           /* Page background — cool light blue-grey */
  --color-panel: #FFFFFF;         /* Card / panel backgrounds */
  --color-panel-alt: #EAF0F8;    /* Alternate panel tint */
  --color-border: #D7E2EE;       /* All borders and dividers */
  --color-ink: #2F5FE0;          /* Primary text + primary action color (blue) */
  --color-ink-dim: #5B6B82;      /* Secondary / muted text */
  --color-amber: #2F5FE0;        /* Accent (mapped to primary blue) */
  --color-amber-soft: #DCE6FB;   /* Soft accent background */
  --color-teal: #0E4C8C;         /* Deep blue for links, emphasis */
  --color-teal-soft: #E1EBF7;    /* Soft teal background */
  --color-sage: #1F8A6B;         /* Success / positive state */
  --color-rust: #C4432E;         /* Error / destructive state */
  --color-navy-deep: #0B1E38;    /* Deepest dark for contrast */

  --font-sans: 'Inter', sans-serif;
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  --radius-custom: 16px;
  --shadow-custom: 0 1px 2px rgba(11,30,56,0.05), 0 12px 32px -18px rgba(11,30,56,0.22);
  --shadow-custom-lg: 0 24px 60px -30px rgba(11,30,56,0.38);
}
```

### Typography Hierarchy

| Element | Font | Weight | Size | Usage |
| --- | --- | --- | --- | --- |
| Page titles / Hero headings | `font-display` (Bricolage Grotesque) | `extrabold` (800) | 28–36px | Screen titles, marketing headers |
| Section headings | `font-display` | `bold` (700) | 20–26px | Card titles, section labels |
| Body text | `font-sans` (Inter) | `medium` (500) | 14–15px | Paragraphs, descriptions |
| Labels / Tags | `font-mono` (IBM Plex Mono) | `semibold` (600) | 10–12px | Uppercase tracking, metadata labels |
| Inputs | `font-sans` | `medium` (500) | 14px | Form fields |

### Visual Rules

1. **Border radius:** Use `rounded-2xl` (16px) for cards and panels. `rounded-lg` (8px) for inputs and small elements. `rounded-full` for pills, avatars, buttons.

2. **Shadows:** Use `shadow-custom` token for cards. Use `shadow-custom-lg` for elevated modals and dropdowns.

3. **Spacing:** Follow a 4px base grid. Standard padding: `p-6` for cards, `px-4 py-2.5` for buttons, `mb-6` between sections.

4. **Color usage:**
   - Primary actions: `bg-ink text-white` (blue buttons).
   - Secondary actions: `border border-border bg-white text-ink`.
   - Destructive: `bg-rust text-white`.
   - Success: `bg-sage text-white`.
   - Locked / gated UI: `bg-amber-soft text-amber` badge + blurred teaser.

5. **Hover states:** Always include `hover:` transitions. Primary buttons: `hover:bg-[#2450C4] hover:-translate-y-[1px]`. Links: `hover:text-ink`. Cards: `hover:shadow-lg`.

6. **Animations:** Use the `animate-fade` utility class for screen transitions. Keep animations subtle — 200ms ease. No flashy animations.

7. **No italic headings.** Display and heading text is always `font-style: normal`.

8. **Icons:** Always use `lucide-react` imports. Custom SVG only when Lucide doesn't have the icon (see the `SearchIcon` and `HomeIcon` patterns in `AppScreens.jsx`).

---

## Rule 4 — Component & Screen Architecture

### Shell Modes

BOMA has four shell modes that control layout. Every screen is mapped to a shell in [`src/constants/screens.js`](file:///d:/Boma_react/src/constants/screens.js):

| Shell Mode | Layout | Screens |
| --- | --- | --- |
| `marketing` | Full-width, no sidenav, footer visible | Landing, How It Works, About, Contact |
| `auth` | Minimal centered layout | Login, Signup, Forgot Password, Reset Password |
| `onboarding` | 2-column: left panel + main content | Entry Path, all `onboarding-*` screens, pod creation flow |
| `app` | 2-column: sidenav + main content, max 1180px | Profile, Matching, Commons, all logged-in screens |
| `admin` | 2-column: sidenav + main content, max 1180px | All `admin-*` screens |

### When Adding a New Screen

1. **Register it** in `src/constants/screens.js`:
   - Add to `SCREENS_ORDER` array.
   - Add label to `SCREENS_LABELS`.
   - Map to shell mode in `SHELL_MODES`.
   - Add URL pattern to `SCREEN_URLS`.
   - If it requires onboarding completion, add to `GATED_SCREENS`.

2. **Create the component** in the appropriate directory:
   - Marketing screens → `src/components/screens/marketing/`
   - Onboarding screens → `src/components/screens/onboarding/`
   - App screens → `src/components/screens/AppScreens.jsx` (inline) or extract to a file in a new `app/` subdirectory.
   - Admin screens → `src/components/screens/admin/`

3. **Wire it** in the parent screen-router component (`MarketingScreens.jsx`, `OnboardingScreens.jsx`, `AppScreens.jsx`, or `AdminScreens.jsx`).

4. **Add routing** in `App.jsx`'s `navigateTo` function and the `handleUrlChange` listener.

### Component Conventions

- **Functional components only.** No class components.
- **Props over global state.** State flows down from `App.jsx` via props. No Redux, no Zustand, no context API (for now).
- **Named exports** for page-level components, **default exports** for screen-aggregator components.
- **File naming:** PascalCase for components (`PodDashboard.jsx`), camelCase for utility modules (`auth.js`, `pods.js`).
- **Co-locate** state close to where it's used. Lift only when two sibling components need it.

---

## Rule 5 — Auth Flow Conventions

BOMA uses **custom authentication** (not Supabase Auth). The full flow lives in [`src/auth.js`](file:///d:/Boma_react/src/auth.js).

### The Auth Flow

1. **Register** → `customRegister(email, password, name)` → inserts into `users` table → sends 6-digit verification code via edge function.
2. **Verify Email** → `customVerifyEmail(email, code)` → sets `email_verified: true`.
3. **Login** → `customLogin(email, password)` → queries `users` table, checks password match.
4. **Password Reset** → `customRequestPasswordReset(email)` → generates code → sends via edge function → `customResetPassword(email, token, newPassword)`.

### Rules

- **Never use `supabase.auth.*` methods.** No `supabase.auth.signUp`, no `supabase.auth.signInWithPassword`. All auth goes through the custom functions in `auth.js`.
- **User session** is stored in `localStorage` as `boma_current_user` / `boma_admin_user` and managed in `App.jsx` state.
- **Email normalization:** Always `email.toLowerCase().trim()` before any database operation.
- **Verification codes** are 6-digit random numbers: `Math.floor(100000 + Math.random() * 900000).toString()`.

---

## Rule 6 — Navigation & Routing

BOMA uses **custom client-side routing** via `window.history.pushState` — no React Router.

### Rules

- **Screen changes** go through the `navigateTo(screenId)` function in `App.jsx`. Never call `setActiveScreen` directly from child components — always use the `navigateTo` prop (usually passed as `setActiveScreen`).
- **URL mapping** is defined in `navigateTo` and the `handleUrlChange` effect in `App.jsx`. When adding new screens, update both.
- **Scroll reset** happens automatically on screen change (`window.scrollTo(0, 0)` in the `useEffect`).
- **Admin path detection** happens on initial load — if URL is `/admin`, route to admin login.

---

## Rule 7 — Data Patterns

### User Object Shape (from `users` table)

```js
{
  id: 'uuid',
  email: 'user@example.com',
  password: 'plaintext',       // custom auth — yes, this is how it works currently
  name: 'Jordan Rivera',
  role: 'user' | 'admin',
  user_onboarded: false,
  email_verified: false,
  verification_code: '123456',
  // Onboarding fields (populated after onboarding flow):
  age_group: '25-34',
  selected_lifestyles: ['remote-work', 'sustainability'],
  decision_style: 'consensus',
  pod_size: '3-5',
  location_city: 'Austin, TX',
  location_radius: '25 miles',
  setting_preference: 'suburban',
  budget_range: '$200k-$400k',
  down_payment_tier: '10-20%',
  financing_preference: 'traditional-mortgage',
  housing_intent: 'purchase-primary',
  commitment_timeline: '5+ years',
  readiness_score: 82
}
```

### Pod Data Shape (currently hardcoded in `App.jsx`)

```js
{
  name: 'Cedar Grove Pod',
  location: 'Austin, TX',
  formed: '12 days ago',
  photo: 'assets/pod_austin.png',
  avgReadiness: 83,
  health: 'Stable',
  matchPct: 87,
  origin: 'Matched via Engine',
  tags: ['Austin, TX', 'Suburban', 'Sustainability', '5+ year commitment'],
  members: [
    { name: 'Sam Rivera', img: 12, detail: '...', score: 88, joined: '12 days ago' }
  ]
}
```

When migrating pods to real data, follow Rule 1 — create `src/api/pods.js` with custom functions.

---

## Rule 8 — Environment & Configuration

- **Client-side env vars** are prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`.
- **Only two client env vars** exist: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Server-side secrets** (SMTP, API keys) live in Supabase Edge Function environment variables (`Deno.env.get()`), **never** in the client `.env`.
- **Never commit `.env` with real keys.** The `.gitignore` already handles this.

---

## Rule 9 — File Organization

```
d:\Boma_react\
├── index.html                          ← HTML shell, Google Fonts, meta
├── vite.config.js                      ← Vite + React + Tailwind plugins
├── package.json                        ← Dependencies (no lockfile changes without reason)
├── .env                                ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── supabase/
│   └── functions/                      ← Edge functions (Deno TS)
│       └── <function-name>/index.ts
├── src/
│   ├── main.jsx                        ← React root render
│   ├── App.jsx                         ← App shell, routing, global state
│   ├── App.css                         ← Minimal app-level styles
│   ├── index.css                       ← Tailwind import + @theme design tokens
│   ├── supabaseClient.js               ← Single Supabase client instance
│   ├── auth.js                         ← Custom auth wrapper functions
│   ├── api/                            ← Custom data wrapper functions (create as needed)
│   ├── constants/
│   │   └── screens.js                  ← Screen registry, shell modes, URL map
│   ├── components/
│   │   ├── Header.jsx                  ← Top navigation bar
│   │   ├── Footer.jsx                  ← Marketing page footer
│   │   ├── Sidenav.jsx                 ← App/admin sidebar navigation
│   │   ├── OnbPanel.jsx                ← Onboarding left panel
│   │   ├── Modals.jsx                  ← All modal overlays
│   │   ├── Toast.jsx                   ← Toast notification component
│   │   ├── ProtoBar.jsx                ← Prototype navigation bar
│   │   ├── auth/                       ← Auth form components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ForgotPassword.jsx
│   │   └── screens/
│   │       ├── MarketingScreens.jsx    ← Marketing screen router
│   │       ├── OnboardingScreens.jsx   ← Onboarding screen router
│   │       ├── AppScreens.jsx          ← App screen router + inline screens
│   │       ├── AdminScreens.jsx        ← Admin screen router
│   │       ├── marketing/              ← Marketing page components
│   │       ├── onboarding/             ← Onboarding step components
│   │       └── admin/                  ← Admin page components
│   └── assets/                         ← Static images and SVGs
```

**Do not create files outside this structure** without confirming with the user. Do not add new top-level `src/` directories without a clear purpose.

---

## Rule 10 — Pre-Flight Scan (Before Any Change)

Before writing any code, **scan the existing codebase** for:

1. **Existing custom functions** in `auth.js` and `api/` — don't duplicate.
2. **Screen registration** in `constants/screens.js` — is the screen already there?
3. **Supabase usage** — grep for `supabase.from(` and `supabase.functions.invoke(` to find any direct calls that should be wrapped.
4. **Token usage** — ensure the colors, fonts, and spacing you need are in `index.css @theme`. If not, add them to the token block, don't inline them.
5. **Component patterns** — look at neighboring components in the same directory for prop patterns, naming, and layout conventions.

**State your findings before coding.** Example:

```
Pre-flight findings:
· Screen 'pod-settings' is NOT registered in screens.js — will add.
· No existing fetchPodSettings function — will create in api/pods.js.
· Supabase directly called in 2 places in AppScreens.jsx L412, L890 — will refactor.
· Token --color-warning does not exist — will add to @theme block.
```

---

## Checklist — Run Before Every PR / Commit

- [ ] No `import { supabase }` in any component/screen file.
- [ ] All new Supabase calls wrapped in custom functions.
- [ ] New screens registered in `screens.js` (all four maps).
- [ ] Edge functions have CORS headers and input validation.
- [ ] All colors use Tailwind token classes (`text-ink`, `bg-panel`, etc.) — no raw hex.
- [ ] All fonts use token families (`font-sans`, `font-display`, `font-mono`).
- [ ] No italic headings.
- [ ] Hover states on all interactive elements.
- [ ] Lucide icons used (no random SVG libraries).
- [ ] `navigateTo` used for screen changes, not raw `setActiveScreen`.
