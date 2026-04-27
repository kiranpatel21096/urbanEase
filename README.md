# UrbanEase — Doorstep Home Services Platform

UrbanEase is a full-stack home-services marketplace that connects urban consumers with verified, skilled professionals for on-demand services like cleaning, plumbing, electrical work, salon, and more. Built as a final-year engineering project, it demonstrates a production-grade React architecture with real-time data, role-based access control, and a multi-step booking workflow.

---

## Live Features

| Area | What's built |
|---|---|
| **Auth** | Email/password signup & login, password reset via email link, auto-profile creation on signup (DB trigger) |
| **Service Catalog** | Browse 9 categories, search by keyword, filter by category, sort by price or rating |
| **Booking Flow** | 4-step wizard — select date & time → pick address → confirm summary → booking confirmed |
| **Customer Dashboard** | Stats overview, active booking card, quick-action grid |
| **Provider Dashboard** | Job queue (accept / reject), advance job status step-by-step, earnings & rating summary |
| **Admin Panel** | Platform-wide KPI overview, manage bookings / users / services |
| **Reviews** | Post-completion star rating + comment; provider average rating updates |
| **Availability** | Provider sets weekly time-slot grid; reflected in booking slot selection |

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Page transitions & micro-interactions |
| React Router v7 | 7 | Client-side routing with lazy loading |
| TanStack Query | 5 | Server state, caching, background refetch |
| Zustand | 5 | Global UI & auth state |
| React Hook Form + Zod | 7 / 4 | Forms with schema validation |
| Lucide React | — | Icon set |
| date-fns | 4 | Date formatting & manipulation |

### Backend / Infrastructure
| Service | Role |
|---|---|
| **Supabase** | PostgreSQL database, Auth (email/password), Row-Level Security |
| **Cloudflare Workers** | Reverse proxy — transparently forwards all Supabase API calls (required on restricted networks) |
| **Vercel** | Frontend hosting & CI/CD |

---

## Architecture Highlights

- **Role-based routing** — Three roles (`customer`, `provider`, `admin`) with dedicated route guards (`ProtectedRoute`, `AdminRoute`) and role-split views inside shared pages.
- **Lazy-loaded routes** — Every page is code-split via `React.lazy` + `Suspense`; the router lives in `src/routes.tsx` for clean separation from `App.tsx`.
- **Auto-profile trigger** — A PostgreSQL `SECURITY DEFINER` function fires on every `auth.users` INSERT and creates the matching `profiles` row automatically — no manual profile creation needed after signup.
- **Cloudflare Worker proxy** — Direct Supabase access is blocked on certain networks. A lightweight Cloudflare Worker (`cloudflare/worker.js`) sits in front and forwards all requests, making the app network-agnostic.
- **Optimistic UX** — TanStack Query mutations invalidate and refetch relevant query keys so UI stays in sync without full page reloads.
- **Multi-step booking state** — Zustand `cartStore` holds the in-progress booking draft (date, time slot, address) across the 4 wizard steps.

---

## Roles & User Journeys

### Customer
1. Register / log in
2. Browse services or search by keyword
3. Open a service → view details, pricing, duration
4. Click **Book Now** → 4-step wizard (date → time → address → confirm)
5. Track booking status on the dashboard — Pending → Confirmed → On the Way → Arrived → In Progress → Completed
6. Cancel while still Pending or Confirmed
7. Leave a star rating + comment after completion

### Service Provider
1. Log in with a provider account
2. View **New Requests** — all Pending bookings with no assigned provider
3. Accept or Reject each request
4. Accepted jobs appear in **My Active Jobs** — advance status step by step
5. Manage weekly availability grid (days × time slots)
6. Dashboard shows pending count, active jobs, completed count, and total earnings

### Admin
1. Log in → redirected to Admin Panel
2. Overview dashboard: total bookings, pending, active providers, customers, active bookings, revenue
3. Bookings tab: full list with status badges and filters
4. Users tab: all registered profiles with role indicators
5. Services tab: toggle service active/inactive, view catalog

---

## Demo Accounts

All demo accounts use password **`Demo@1234`**

| Role | Email | Name |
|---|---|---|
| Customer | `customer1@demo.urbanease.in` | Priya Sharma |
| Customer | `customer2@demo.urbanease.in` | Rahul Desai |
| Provider | `provider1@demo.urbanease.in` | Meera Sharma |
| Provider | `provider2@demo.urbanease.in` | Rajan Mehta |
| Admin | `admin@demo.urbanease.in` | Admin User |

> Demo accounts are pre-confirmed — no email verification required.

---

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Badge, Input, Select, Card
│   ├── layout/      # Header, Footer, RootLayout
│   ├── shared/      # EmptyState, ProtectedRoute, AdminRoute, StarRating
│   ├── booking/     # AddressModal
│   ├── home/        # Hero, CategoryGrid, FeaturedServices, HowItWorks
│   └── services/    # ServiceCard
├── pages/
│   ├── admin/       # AdminLayout, AdminDashboardPage, AdminBookingsPage, ...
│   ├── DashboardPage.tsx
│   ├── DashboardBookingsPage.tsx
│   ├── BookingPage.tsx
│   ├── BookingDetailPage.tsx
│   └── ...
├── hooks/           # useBookings, useServices, useProviders, useReviews, ...
├── store/           # authStore, cartStore
├── lib/             # supabase.ts, utils.ts, queryClient.ts
├── types/           # index.ts — all shared TypeScript interfaces
├── data/            # mockData.ts — service categories & static seed data
└── routes.tsx       # All route definitions (lazy-loaded)
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- A Supabase project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/urbanEase.git
cd urbanEase
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> If direct Supabase access is blocked on your network, deploy the Cloudflare Worker (see below) and set `VITE_SUPABASE_URL` to the Worker URL instead.

### 3. Set up the database

1. Open your Supabase project → **SQL Editor**
2. Run the full schema + seed script at `supabase/seed.sql`

   This script creates all 7 tables, the auto-profile trigger, 5 demo auth users, sample services, providers, bookings, reviews, and availability slots.

3. In **Authentication → Settings**, set **Email confirmations** to **Disabled** (for local dev / demo — users can log in immediately after signup).

### 4. Run the dev server

```bash
npm run dev
```

App is available at `http://localhost:5173`.

---

## Cloudflare Worker (optional — restricted networks only)

If your network blocks direct Supabase access:

```bash
# Install Wrangler
npm install -g wrangler

# Deploy the proxy worker
CLOUDFLARE_API_TOKEN=<your-token> npx wrangler deploy --config cloudflare/wrangler.toml
```

Then update `VITE_SUPABASE_URL` in `.env.local` to the Worker URL.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User profile — name, email, role, avatar |
| `services` | Service catalog — name, category, price, duration |
| `providers` | Provider profile — bio, skills, rating, location |
| `bookings` | Booking records — customer, provider, service, status, price |
| `addresses` | Saved customer addresses |
| `provider_availability` | Weekly availability grid (day × time slot) |
| `reviews` | Star ratings + comments linked to completed bookings |
