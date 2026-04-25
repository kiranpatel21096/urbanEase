# UrbanEase - Agent Instructions & Project Context

## Project Overview
UrbanEase is a doorstep home-services platform that connects urban consumers with verified, skilled professionals for various services. It serves as a modern React.js frontend architecture showcase for a final year project.

## Architecture & Tech Stack
- **Frontend Core:** React 18 + TypeScript, Vite
- **Styling:** Tailwind CSS (Latest), shadcn/ui, Framer Motion
- **State Management:** Zustand (global UI/auth state), TanStack Query (server state caching)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment:** Vercel (Frontend), Supabase (Backend Database & Auth)

## Agent Workflow Guidelines
1. **Source of Truth:** This file (`INSTRUCTIONS.md` / `CLAUDE.md`), `RULES.md`, and `TODO.md` serve as the ultimate sources of truth.
2. **Context Resumption:** If picking up from a previous session, always consult `TODO.md` first to determine the current state and pending tasks.
3. **Execution:** Refer to `RULES.md` for coding standards, UI guidelines, and architecture conventions before writing new components.
4. **Tracking:** Always update `TODO.md` whenever a sub-task or feature is completed.

## Folder Structure
- `src/components/`: Reusable components (organized by domain: `ui/`, `layout/`, `home/`, `services/`, etc.)
- `src/pages/`: Route-level components.
- `src/hooks/`: Custom React hooks (`useAuth`, `useBooking`).
- `src/store/`: Zustand global state slices.
- `src/lib/`: Utilities (`supabase.ts`, `utils.ts`, `queryClient.ts`).
- `src/types/`: TypeScript definitions.
- `src/data/`: Mock data or seed scripts.

## Current Environment
- Package Manager: `npm`
- Tailwind Version: Latest stable
- Repository Location: `c:\Users\Parimal\OneDrive\Documents\gtu\urbanEase`

## Cloudflare Proxy (Supabase)

Direct access to Supabase (`mpbmusdufavfhrqhbfrc.supabase.co`) is blocked on the development network without a VPN. A Cloudflare Worker transparently proxies all Supabase traffic.

- **Worker URL:** `https://urbanease-supabase-proxy.kiranpatel21096.workers.dev`
- **Worker source:** `cloudflare/worker.js` + `cloudflare/wrangler.toml`
- **Redeploy:** `CLOUDFLARE_API_TOKEN=<token> npx wrangler deploy --config cloudflare/wrangler.toml`
- **`.env.local`** must have `VITE_SUPABASE_URL` set to the Worker URL above (not the raw Supabase URL).
- If the Worker needs updating, edit `cloudflare/worker.js` and redeploy with the command above.

Important: DO NOT COMMIT YOURSELF. ASK MY APPROVAL