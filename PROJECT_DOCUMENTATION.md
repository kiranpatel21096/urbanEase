# UrbanEase — Complete Project Documentation

**Platform:** Doorstep Home Services Marketplace  
**Type:** Full-Stack Web Application — Final Year Engineering Project  
**Stack:** React 19 · TypeScript · Supabase · Tailwind CSS · Cloudflare Workers  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Application Pages — Complete Reference](#6-application-pages--complete-reference)
7. [End-to-End User Journeys](#7-end-to-end-user-journeys)
8. [Booking Lifecycle](#8-booking-lifecycle)
9. [State Management](#9-state-management)
10. [Data Fetching Layer](#10-data-fetching-layer)
11. [Authentication System](#11-authentication-system)
12. [Key Engineering Decisions](#12-key-engineering-decisions)
13. [Demo Accounts & Test Data](#13-demo-accounts--test-data)
14. [Project Setup Guide](#14-project-setup-guide)

---

## 1. Project Overview

UrbanEase is a doorstep home-services platform that bridges the gap between urban consumers and skilled, verified professionals. Customers can discover, compare, and book services directly from a mobile-first web application, while professionals manage job requests, update booking status in real time, and control their weekly availability. A platform administrator oversees the entire ecosystem through a dedicated panel.

### Problem Statement
Urban households in India face three recurring problems when hiring home service professionals: unreliable quality, opaque pricing, and no way to track service progress. UrbanEase solves all three by providing verified provider profiles, fixed transparent pricing, and a real-time status-update workflow modelled on the Urban Company / Swiggy pattern.

### Core Value Propositions
| For Customers | For Providers | For Platform |
|---|---|---|
| Browse 200+ services in one place | Receive job requests without cold-calling | Full visibility into bookings, revenue, users |
| Fixed price — no surprise charges | Accept or reject jobs from a mobile-friendly dashboard | Toggle service availability instantly |
| Track professional in real time | Advance job status step by step | Data-driven decision making via KPI overview |
| Review after every job | Set weekly availability once, updated any time | Role-based access control throughout |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  React 19 + TypeScript                                          │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ React      │  │ Zustand      │  │ TanStack Query        │  │
│  │ Router v7  │  │ (auth+cart)  │  │ (server state cache)  │  │
│  └────────────┘  └──────────────┘  └───────────────────────┘  │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS requests
                             ▼
┌────────────────────────────────────────────────────────────────┐
│              Cloudflare Worker (Reverse Proxy)                 │
│         urbanease-supabase-proxy.kiranpatel21096.workers.dev   │
│  Forwards all /rest/v1/* and /auth/v1/* traffic to Supabase    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                     Supabase Backend                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL  │  │ Auth Service │  │ Row Level Security   │  │
│  │ (7 tables)  │  │ (JWT tokens) │  │ (per-table policies) │  │
│  └─────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Why a Cloudflare Worker Proxy?
On campus/corporate networks, direct requests to `*.supabase.co` are blocked by firewall rules. The Cloudflare Worker acts as a transparent HTTPS relay — the client calls the Worker URL, the Worker forwards the request with the original headers to Supabase, and returns the response. From the application's perspective, nothing changes except the base URL in the environment variable.

---

## 3. Technology Stack

### Frontend Libraries

| Library | Version | Role in Project |
|---|---|---|
| **React** | 19 | Component model, rendering, hooks |
| **TypeScript** | 6 | Static typing across entire codebase |
| **Vite** | 8 | Dev server with HMR, production bundler |
| **Tailwind CSS** | 4 | Utility-first styling, responsive breakpoints |
| **Framer Motion** | 12 | Page transitions, micro-animations, staggered lists |
| **React Router** | 7 | SPA routing, lazy loading, route guards |
| **TanStack Query** | 5 | Server state caching, background refetch, mutations |
| **Zustand** | 5 | Lightweight global state (auth + booking draft) |
| **React Hook Form** | 7 | Performant form management |
| **Zod** | 4 | Schema validation (used with React Hook Form) |
| **@supabase/supabase-js** | 2 | Supabase client (database + auth) |
| **Lucide React** | — | Consistent icon library (300+ icons) |
| **date-fns** | 4 | Date formatting, time slot past-check |
| **React Leaflet** | 5 | Map rendering (provider location) |

### Backend / Infrastructure

| Service | Purpose |
|---|---|
| **Supabase PostgreSQL** | Primary database — all 7 tables |
| **Supabase Auth** | Email/password authentication, JWT sessions |
| **Supabase Row Level Security** | Database-level access control policies |
| **Cloudflare Workers** | Network-agnostic proxy for Supabase API |
| **Vercel** | Frontend hosting, CI/CD from GitHub |

---

## 4. Database Schema

### Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    ├──▶ profiles (1:1)         — role, full_name, avatar
    ├──▶ providers (0:1)        — bio, skills, rating (only if role=provider)
    ├──▶ addresses (1:N)        — saved delivery addresses
    └──▶ bookings (as customer) (1:N)
              │
              ├──▶ services (N:1)
              ├──▶ providers (N:1)       — assigned professional
              ├──▶ addresses (N:1)       — service address
              └──▶ reviews (1:0..1)      — post-completion rating

providers
    └──▶ provider_availability (1:N)    — weekly time-slot grid
```

### Table Definitions

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Matches `auth.users.id` |
| full_name | text | |
| email | text | |
| phone | text | nullable |
| avatar_url | text | nullable |
| role | text | 'customer' \| 'provider' \| 'admin' |
| created_at | timestamptz | |

**Trigger:** `on_auth_user_created` fires after every INSERT into `auth.users` and auto-creates the matching `profiles` row using `raw_user_meta_data` (full_name, role). This means no manual profile creation is needed after signup.

#### `services`
| Column | Type | Notes |
|---|---|---|
| id | text (PK) | Short IDs: s1–s9 |
| name | text | |
| description | text | |
| category | text | ServiceCategory enum |
| base_price | numeric | INR, excludes platform fee |
| duration_minutes | integer | |
| thumbnail_url | text | |
| is_active | boolean | Admin can toggle |
| avg_rating | numeric | nullable |
| total_reviews | integer | nullable |
| badge | text | 'Top Rated' \| 'New' \| 'Popular' \| null |

#### `providers`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid | FK → auth.users |
| name | text | |
| bio | text | |
| avatar_url | text | |
| experience_years | integer | |
| avg_rating | numeric | Calculated from reviews |
| total_reviews | integer | |
| skills | text[] | Array of skill strings |
| is_verified | boolean | Admin-verified badge |
| lat / lng | numeric | For map display |
| city | text | |

#### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| customer_id | uuid | FK → auth.users |
| provider_id | uuid | FK → providers, nullable (set when accepted) |
| service_id | text | FK → services |
| address_id | uuid | FK → addresses |
| scheduled_at | timestamptz | |
| status | text | BookingStatus enum (9 values) |
| total_price | numeric | base_price + 49 platform fee |
| otp | text | 4-digit code for verification |
| created_at | timestamptz | |

#### `addresses`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid | FK → auth.users |
| label | text | 'Home' \| 'Work' \| 'Other' |
| line1 | text | Street address |
| city | text | |
| pincode | text | |
| lat / lng | numeric | nullable |
| is_default | boolean | Only one default per user |

#### `provider_availability`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| provider_id | uuid | FK → providers (stored as text) |
| day_of_week | integer | 0=Sunday … 6=Saturday |
| time_slot | text | e.g. '09:00' |
| is_available | boolean | |

**Unique constraint:** `(provider_id, day_of_week, time_slot)` — allows safe UPSERT.

#### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | auto-generated |
| booking_id | uuid | FK → bookings |
| customer_id | uuid | FK → auth.users |
| provider_id | text | FK → providers |
| rating | integer | 1–5 |
| comment | text | nullable |
| created_at | timestamptz | |

---

## 5. User Roles & Permissions

### Role Assignment
Role is stored in two places for redundancy: `auth.users.raw_user_meta_data.role` (set at signup) and `profiles.role` (written by DB trigger). The `useAuthStore` reads from the session's `user_metadata`, which is set during `auth.signUp()`.

### Permission Matrix

| Feature | Customer | Provider | Admin |
|---|---|---|---|
| Browse services / search | ✅ | ✅ | ✅ |
| View provider profiles | ✅ | ✅ | ✅ |
| Book a service | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | — | — |
| Leave a review | ✅ (after completion) | — | — |
| Accept / reject job requests | — | ✅ | — |
| Advance booking status | — | ✅ | — |
| Set weekly availability | — | ✅ | — |
| View all bookings | — | — | ✅ |
| View all users | — | — | ✅ |
| Toggle service active/inactive | — | — | ✅ |
| View platform KPIs & revenue | — | — | ✅ |

### Route Guards

| Guard | Where Used | Logic |
|---|---|---|
| `ProtectedRoute` | All `/dashboard/*`, `/book/:id` | Redirects to `/login` if no authenticated user |
| `AdminRoute` | All `/admin/*` | Redirects to `/login` if no user; `/dashboard` if role ≠ admin |
| `GuestOnlyRoute` | `/` (home) | Redirects logged-in users to `/admin` (admin) or `/dashboard` (others) |

---

## 6. Application Pages — Complete Reference

### Public Pages (No Login Required)

---

#### `/` — Home Page

**Purpose:** Marketing landing page for unauthenticated visitors.

**Sections (top to bottom):**

1. **HeroSection**
   - Animated headline: *"Expert Home Services, Delivered to Your Door"*
   - Large search bar that navigates to `/search?q=<query>`
   - Popular search tags (AC Service, Cleaning, Plumbing, Salon)
   - CTA buttons: "Explore Services" → `/services`, "Become a Pro" → `/register`
   - Floating stat cards: 10,000+ Verified Pros, 4.8★ Avg Rating, 98% On-Time Rate

2. **CategoryGrid**
   - 8 service categories with icons and service counts
   - Each card links to `/services?category=<name>`
   - Hover animation (shadow + border highlight)

3. **HowItWorks**
   - 3-step explainer: Search & Browse → Book Instantly → Relax at Home
   - Step icons, step numbers, connecting gradient line (desktop)

4. **StatsBar**
   - Full-width primary-colour bar: 10,000+ Pros, 50,000+ Bookings, 4.8/5 Rating, 25+ Cities

5. **Testimonials**
   - 4-card carousel (auto-rotates every 5 seconds)
   - Each card: customer avatar, star rating, quote, name, city, service type
   - Manual prev/next controls + dot indicators

**Redirect rule:** Authenticated users hitting `/` are redirected to `/dashboard` (customers/providers) or `/admin` (admin).

---

#### `/services` — Service Catalog

**Purpose:** Browse and filter the full service catalog.

**Features:**
- Horizontal scrollable category filter tabs ("All" + 9 categories)
- Search bar (filters by service name, category, description simultaneously)
- Sort dropdown: Popular · Price Low–High · Price High–Low · Rating
- Responsive grid: 1 col (mobile) → 2 col (sm) → 3 col (lg) → 4 col (xl)
- Result count label ("12 services found in Beauty & Salon")
- Empty state with "Clear filters" CTA

**ServiceCard renders:**
- Thumbnail image with badge overlay (Top Rated / New / Popular)
- Category chip, service name, description (truncated)
- Duration, star rating, review count
- Base price with "Book Now" button → `/book/<service_id>`

**URL Params:** `?category=<name>` pre-selects a category; `?q=<query>` pre-fills search

---

#### `/services/:id` — Service Detail

**Purpose:** Full detail view of a single service with provider suggestions.

**Layout (2-column on lg):**

Left panel:
- Large banner image
- Description, "What's Included" checklist
- Up to 3 provider cards matching the service category (name, rating, experience, skills)

Right panel (sticky on desktop):
- Service name, category badge
- Price (`₹X`) and duration (`X min`)
- Star rating + review count
- "Book Now" primary button → `/book/<service_id>`
- "View All Providers" link → `/search?q=<category>`

---

#### `/search` — Find Professionals

**Purpose:** Search services with a query (typically from HeroSection or nav).

**Features:**
- Search bar at top (updates URL param and filters list)
- Services grid (same ServiceCard as /services)
- Supports `?q=<query>` URL parameter
- Empty state for no matches

---

#### `/providers/:id` — Provider Profile

**Purpose:** Public profile for a service professional.

**Sections:**
1. **Profile card** — gradient banner, avatar, name, verified badge (✓), city, experience years, star rating, bio, skill badges
2. **Rating Breakdown** — large average rating number + horizontal bar chart per star level (5★ down to 1★)
3. **Customer Reviews** — cards with reviewer name, avatar, date, star rating, comment text

**Action:** "Book Now" button → `/services?q=<provider_skill[0]>`

---

#### `/login` — Login

**Features:**
- Email + password form with Zod validation
- Error banner for invalid credentials and unconfirmed email
- "Forgot password?" link → `/forgot-password`
- "Don't have an account? Sign up" link → `/register`
- **Demo Accounts panel** (collapsible) — lists 5 pre-seeded accounts with a "Fill" button each; clicking pre-fills the form with that email and `Demo@1234`; user still clicks Sign In manually

---

#### `/register` — Sign Up

**Features:**
- Role selector toggle: **Customer** (default) or **Service Pro**
- Fields: Full Name, Email, Password (min 6 chars)
- Zod validation on all fields
- On success: if `data.session` returned immediately (email confirmation disabled) → redirects to home; otherwise shows "check your inbox" screen
- Terms of Service + Privacy Policy links at bottom

---

#### `/forgot-password` — Forgot Password

**Features:**
- Single email input
- Calls `supabase.auth.resetPasswordForEmail()` with redirect URL
- "Check your email" success screen with back-to-login link

---

#### `/reset-password` — Set New Password

**Features:**
- New Password + Confirm Password fields (must match — Zod refine)
- Calls `supabase.auth.updateUser({ password })`
- On success: shows confirmation screen → auto-redirects to `/login` after 2.5 seconds

**Access:** Only reachable via the password reset email link (Supabase injects recovery token into URL)

---

#### `/terms` and `/privacy` — Legal Stubs

Placeholder pages with "Coming soon" text. Linked from the registration page and footer.

---

### Protected Pages (Login Required)

---

#### `/book/:serviceId` — Booking Wizard

**Purpose:** Multi-step booking form for a specific service.

**Step 1 — Date & Time**
- 7-day date selector (today + next 6 days) shown as cards with day name, date, month
- 10 time slots (8:00 AM – 6:00 PM); past time slots on today are disabled
- Selected state highlighted in primary colour
- Continue button enabled only when both date and time are chosen

**Step 2 — Select Address**
- Lists all saved addresses (label, street, city, pincode)
- "Default" label on default address
- "Add new address" dashed button → opens AddressModal
  - Modal form: label (Home/Work/Other), line 1, city, pincode
  - Zod validation; creates address via `useCreateAddress` mutation
- Continue button enabled when address is selected

**Step 3 — Summary**
- Service thumbnail, name, category, duration
- Booking details: date, time, full address
- Price breakdown:
  - Service fee: `₹<base_price>`
  - Platform fee: `₹49`
  - **Total: `₹<base_price + 49>`**
- "Pay at doorstep after service completion" notice
- Back and Confirm Booking buttons

**Step 4 — Confirmation**
- Green checkmark animation (Framer Motion spring)
- Booking ID (first 8 chars, uppercase)
- "A professional will accept your request shortly" message
- "Go Home" and "View Bookings" buttons
- Clears `cartStore` draft on confirmation

**Progress Stepper:** 4-step indicator across the top; step labels hidden on mobile, shown on sm+.

---

#### `/dashboard` — Dashboard Home

**Customer view:**
- Greeting with time-of-day (Good morning/afternoon/evening) + date
- Stats row: Total Bookings · Upcoming · Completed (3-column responsive grid)
- Active Booking card (if one exists) — shows service, status badge, provider name, date, price; clickable → booking detail
- "No active bookings" CTA if nothing in progress
- Quick Actions grid (2-col responsive): Book a Service · Find Providers · My Bookings · Edit Profile

**Provider view:**
- Greeting + provider info card (avatar, name, rating, verified badge)
- Stats grid (2-col responsive): Pending Requests · Active Jobs · Jobs Completed · Total Earnings (sum of all completed booking prices)
- "N new job requests waiting" orange CTA banner (shown when pendingJobs > 0)
- Quick Actions grid: Job Queue · My Availability · Edit Profile · Find Services

---

#### `/dashboard/bookings` — Bookings / Job Queue

**Customer view (3 tabs):**

| Tab | Statuses shown |
|---|---|
| Upcoming | Pending, Confirmed, Pro Assigned, On the Way, Arrived, In Progress |
| Completed | Completed |
| Cancelled | Cancelled, Rejected |

Each booking card shows: service thumbnail, service name, provider name (with link to provider profile) or "Awaiting professional", status badge, scheduled date, duration, address city, total price. Clicking a card navigates to `/dashboard/bookings/:id`.

**Provider view (2 tabs):**

*New Requests tab:*
- Lists all `Pending` bookings with no `provider_id` set
- Each card has Reject (red) and Accept (green) buttons
- Accept: sets `status='Confirmed'` and `provider_id=<myProvider.id>`
- Reject: sets `status='Rejected'`
- Red badge showing count of pending requests on the tab

*My Active Jobs tab:*
- Lists all bookings where `provider_id = myProvider.id`
- Shows "Mark as {nextStatus}" button based on current status (see Booking Lifecycle)
- Completed jobs show a "Job Completed" success badge

---

#### `/dashboard/bookings/:id` — Booking Detail

**Header card:**
- Service thumbnail, name, category
- Status badge
- Booking ID (short format: `#ABC12345`)
- Date, duration, address
- Provider card (avatar, name, rating, city) — links to provider profile
- Total price

**Progress Timeline:**
- 7-step vertical timeline (Pending → Confirmed → Pro Assigned → On the Way → Arrived → In Progress → Completed)
- Completed steps: green circle with checkmark
- Current step: primary-colour filled circle
- Future steps: muted circle
- Current step shows descriptive label beneath (e.g. "Professional is on the way")
- Collapses to a single "Booking Rejected" or "Booking Cancelled" error card for terminal failure statuses

**About the Service card:**
- Service thumbnail, name, category + duration
- "View Service" link → `/services/<service_id>`
- "Book Again" link → `/book/<service_id>` (customers only)

**Cancel button** (customers only, visible when status is Pending or Confirmed):
- Calls `useUpdateBookingStatus` with `status='Cancelled'`

**Review section** (customers only, after Completed status, no existing review):
- 5-star interactive rating (hover + click)
- Comment textarea
- Submit Review button

**Existing review display:**
- Shows previously submitted star rating + comment (read-only)

---

#### `/dashboard/availability` — Weekly Availability (Provider only)

**Purpose:** Providers configure which time slots they are available each week.

**Layout:**
- Table: Rows = 10 time slots (8:00 AM – 5:00 PM), Columns = 7 days (Sun–Sat)
- Each cell is a toggle button
- Blue filled = available, muted grey = unavailable
- Default state: all cells available (when no DB rows exist for a slot, it's treated as available)
- Toggling a cell calls `useUpsertAvailability` with `(provider_id, day_of_week, time_slot, !current)`

**Access:** Provider-only. Non-providers redirected to `/dashboard/bookings`.

---

#### `/dashboard/profile` — Profile Settings

**Features:**
- Displays current avatar (initial letter if no image), full name, email, role
- Editable fields: Full Name, Phone number
- Email field (read-only — cannot change email here)
- Zod schema validation
- Save Changes button → calls Supabase `updateUser` + updates `profiles` table
- "Saved!" success flash for 3 seconds

---

### Admin Pages (`/admin/*`)

All admin pages share the **AdminLayout**: fixed dark sidebar (Desktop) with logo, navigation links, and Sign Out button. All pages enforce `AdminRoute` guard — any non-admin user is redirected.

---

#### `/admin` — Admin Dashboard

**KPI Cards (6, in 3-column responsive grid):**
- Total Bookings (all time)
- Pending Requests (status='Pending')
- Active Providers (total provider count)
- Customers (total profiles with role='customer')
- Active Bookings (non-terminal statuses: not Completed/Cancelled/Rejected)
- Revenue — sum of `total_price` for all Completed bookings, formatted as ₹XX,XXX

**Recent Bookings (last 5):**
- Service name, customer name, scheduled date, amount, status badge

**Recent Sign-ups (last 5):**
- Avatar, full name, email, role badge, joined date

**Quick Action links:** → Manage Bookings · → Manage Users · → Manage Services

---

#### `/admin/bookings` — All Bookings

**Features:**
- Filter pills: All + each individual BookingStatus (9 options)
- Table columns: Booking ID (short), Service name, Provider name (or "Unassigned"), Scheduled date, Amount, Status badge
- Row hover highlight
- Skeleton loading state (3 placeholder rows)

---

#### `/admin/users` — All Users

**Features:**
- Filter pills: Customers | Providers
- Table columns: Name (with avatar), Email, Phone (or "—"), Joined date
- Row hover highlight
- Skeleton loading state

---

#### `/admin/services` — Service Catalog Management

**Features:**
- Filter pills: All | Active | Inactive
- Table columns: Service (thumbnail + name), Category, Base Price, Avg Rating, Status
- Status column shows "Active" / "Inactive" toggle button
- Toggling calls `useToggleService` mutation (flips `is_active`)
- "Add Service" button (present in UI, currently non-functional — admin SQL required)
- Thumbnail images rendered inline in table rows

---

## 7. End-to-End User Journeys

### Journey 1 — New Customer Booking a Service

```
1. Land on Home Page (/)
   ↓ Sees hero CTA, category grid, how-it-works
   
2. Click "Explore Services" → /services
   ↓ Browses 9 services, applies "Home Cleaning" filter
   
3. Click "Deep Home Cleaning" ServiceCard
   ↓ Opens /services/s2 (Service Detail)
   ↓ Reads description, price (₹1,299), duration (180 min)
   ↓ Sees available providers in the right panel
   
4. Click "Book Now" → redirected to /login (not logged in)

5. Register at /register
   ↓ Selects "Customer" role
   ↓ Enters full name, email, password
   ↓ If auto-confirm: lands on /dashboard
   ↓ If email confirm required: checks inbox, confirms, then logs in

6. Navigate back to /services/s2 → click "Book Now" → /book/s2

7. Step 1 — Select date (e.g. tomorrow) and time (e.g. 10:00 AM)
   ↓ Click Continue

8. Step 2 — No saved addresses → click "Add new address"
   ↓ AddressModal: enter Home, "12 Shyamal Row Houses", Ahmedabad, 380015
   ↓ Address created and auto-selected
   ↓ Click Continue

9. Step 3 — Review summary
   ↓ Service fee ₹1,299 + Platform fee ₹49 = Total ₹1,348
   ↓ Click "Confirm Booking"

10. Step 4 — Confirmation screen
    ↓ Booking ID shown (e.g. #A1B2C3D4)
    ↓ Click "View Bookings" → /dashboard/bookings

11. Dashboard Bookings — "Upcoming" tab
    ↓ Booking appears with status "Pending" and "Awaiting professional"

12. Provider accepts (separate provider journey) → status becomes "Confirmed"
    ↓ Provider name and rating now visible on booking card

13. Provider advances status through: On the Way → Arrived → In Progress → Completed

14. Customer visits /dashboard/bookings/:id after completion
    ↓ Review section appears
    ↓ Selects 5 stars, types a comment, clicks "Submit Review"
    ↓ Review submitted confirmation shown
```

---

### Journey 2 — Provider Managing a Job

```
1. Login as provider1@demo.urbanease.in
   ↓ Redirected to /dashboard (provider view)

2. Dashboard shows stats: Pending Requests, Active Jobs, Completed, Earnings
   ↓ Sees orange banner: "2 new job requests waiting"

3. Click banner → /dashboard/bookings

4. "New Requests" tab (default)
   ↓ Sees pending booking cards with service, date, address, price
   
5. Click "Accept" on a booking
   ↓ Status → "Confirmed", provider_id set to this provider
   ↓ Booking moves out of New Requests
   ↓ Pending badge count decreases

6. Switch to "My Active Jobs" tab
   ↓ Sees the accepted booking
   ↓ "Mark as On the Way" button

7. Day of service — click "Mark as On the Way"
   ↓ Status → "On the Way"
   ↓ Button updates to "Mark as Arrived"

8. Upon arrival — click "Mark as Arrived"
   ↓ Status → "Arrived"
   ↓ Button updates to "Mark as In Progress"

9. Start service — click "Mark as In Progress"
   ↓ Status → "In Progress"
   ↓ Button updates to "Mark as Completed"

10. Finish service — click "Mark as Completed"
    ↓ Status → "Completed"
    ↓ "Job Completed" badge shown
    ↓ Earnings on dashboard increase by booking total price

11. Navigate to /dashboard/availability
    ↓ Toggle off Sunday slots (not available weekends)
    ↓ Changes saved immediately per cell toggle
```

---

### Journey 3 — Admin Overseeing the Platform

```
1. Login as admin@demo.urbanease.in
   ↓ Redirected to /admin (not /dashboard)
   ↓ Header shows admin nav: Dashboard · Bookings · Users · Services

2. Admin Dashboard (/admin)
   ↓ Reviews KPI cards: total bookings, revenue, pending count
   ↓ Checks Recent Bookings panel — sees last 5 with statuses
   ↓ Checks Recent Sign-ups — sees newest registered users

3. Navigate to /admin/bookings
   ↓ Views all bookings across all users and providers
   ↓ Filters by "Pending" → sees unassigned booking requests
   ↓ Filters by "Completed" → verifies revenue-generating bookings

4. Navigate to /admin/users
   ↓ Switches between "Customers" and "Providers" filter
   ↓ Verifies user registrations, checks phone numbers

5. Navigate to /admin/services
   ↓ Sees all 9 services with active/inactive status
   ↓ Toggles "Pest Control" to inactive (is_active = false)
   ↓ Service no longer appears in customer-facing catalog
   ↓ Toggles it back to active

6. Admin can also navigate to /services, /search, /dashboard 
   (full app access — all ProtectedRoute pages are accessible to admin)
```

---

## 8. Booking Lifecycle

### Status Flow Diagram

```
                     ┌─────────┐
                     │ Pending │  ← Created by customer
                     └────┬────┘
                          │
              ┌───────────┼───────────┐
              │                       │
              ▼                       ▼
        ┌──────────┐           ┌──────────┐
        │ Confirmed │           │ Rejected │  ← Provider rejects
        └─────┬─────┘           └──────────┘
              │
              │  (Customer can cancel up to here)
              ▼
        ┌────────────┐
        │  On the Way│  ← Provider advances
        └─────┬──────┘
              ▼
          ┌─────────┐
          │ Arrived │
          └────┬────┘
               ▼
         ┌────────────┐
         │ In Progress│
         └─────┬──────┘
               ▼
         ┌───────────┐          ┌───────────┐
         │ Completed │          │ Cancelled │  ← Customer cancels (Pending/Confirmed only)
         └───────────┘          └───────────┘
```

### Status Descriptions

| Status | Set By | Meaning |
|---|---|---|
| Pending | System (on booking creation) | Request placed, no provider assigned |
| Confirmed | Provider (Accept action) | Provider accepted, `provider_id` set |
| Rejected | Provider (Reject action) | Provider declined — customer can re-book |
| Pro Assigned | System (future) | Specific professional allocated (reserved status) |
| On the Way | Provider | Professional has left for the address |
| Arrived | Provider | Professional is at the customer's location |
| In Progress | Provider | Service is being performed |
| Completed | Provider | Job done — review unlocked for customer |
| Cancelled | Customer | Customer cancelled (Pending or Confirmed only) |

### Provider Status Transition Map
```
Confirmed → On the Way → Arrived → In Progress → Completed
```
Each transition is a single button click in the "My Active Jobs" tab.

---

## 9. State Management

### Auth Store (`useAuthStore`)

```typescript
interface AuthStore {
  user: User | null          // null = not logged in
  isLoading: boolean         // true while session is resolving
  isInitialized: boolean     // true after first auth check
  setUser(user): void
  setLoading(loading): void
  setInitialized(init): void
  logout(): void             // clears user, resets flags
}
```

- Persisted to localStorage (`urbanease-auth`)
- Hydrated from Supabase session on `useAuthInit()` call (runs once in main.tsx)
- Listens to `onAuthStateChange` — updates store on SIGNED_IN / SIGNED_OUT events

### Cart Store (`useCartStore`)

```typescript
interface BookingDraft {
  service?: Service
  provider?: Provider
  date?: string        // 'yyyy-MM-dd'
  timeSlot?: string    // 'hh:mm aa'
  addressId?: string   // uuid
}

interface CartStore {
  bookingDraft: BookingDraft
  setService(s): void
  setProvider(p): void
  setDate(d): void
  setTimeSlot(t): void
  setAddress(id): void
  resetDraft(): void   // called after successful booking confirmation
}
```

- Persisted to localStorage (`urbanease-cart`)
- Enables bookingDraft to survive page refresh during the multi-step wizard
- Reset via `resetDraft()` after step 4 confirmation

---

## 10. Data Fetching Layer

All server data is managed through **TanStack Query** (React Query). No `useEffect`-based fetching. Every hook returns `{ data, isLoading, error }` or `{ mutate, isPending, error }`.

### Query Keys

| Hook | Query Key | Stale Time |
|---|---|---|
| `useServices()` | `['services']` | 10 min |
| `useService(id)` | `['service', id]` | 10 min |
| `useProviders()` | `['providers']` | 10 min |
| `useProvider(id)` | `['provider', id]` | 10 min |
| `useMyProvider()` | `['my-provider', userId]` | 5 min |
| `useBookings()` | `['bookings', userId]` | 2 min |
| `useBooking(id)` | `['booking', id]` | 30 sec |
| `useProviderBookings(pid)` | `['provider-bookings', pid]` | 30 sec |
| `useAddresses()` | `['addresses', userId]` | 5 min |
| `useProviderAvailability(pid)` | `['availability', pid]` | 5 min |
| `useReviews(pid)` | `['reviews', pid]` | 5 min |
| `useBookingReview(bid)` | `['booking-review', bid]` | 5 min |
| `useProviderEarnings(pid)` | `['provider-earnings', pid]` | 2 min |

### Mutations with Cache Invalidation

| Hook | Mutation | Invalidates |
|---|---|---|
| `useCreateBooking` | INSERT bookings | `['bookings']` |
| `useUpdateBookingStatus` | UPDATE bookings.status | `['bookings']`, `['booking', id]`, `['provider-bookings']` |
| `useCreateAddress` | INSERT addresses | `['addresses']` |
| `useDeleteAddress` | DELETE addresses | `['addresses']` |
| `useUpsertAvailability` | UPSERT provider_availability | `['availability']` |
| `useCreateReview` | INSERT reviews | `['booking-review']`, `['reviews']` |
| `useToggleService` (admin) | UPDATE services.is_active | `['services']`, `['admin-services']` |

---

## 11. Authentication System

### Signup Flow
```
User fills RegisterPage form
→ supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })
→ Supabase creates auth.users row
→ DB trigger on_auth_user_created fires
→ INSERT into profiles (id, full_name, email, role, created_at)
→ If email confirmation disabled: data.session returned → navigate to /dashboard
→ If email confirmation enabled: data.session = null → show "check inbox" screen
```

### Login Flow
```
User fills LoginPage form
→ supabase.auth.signInWithPassword({ email, password })
→ On success: onAuthStateChange fires SIGNED_IN event
→ useAuthInit listener calls setUser(session.user merged with profiles.role)
→ GuestOnlyRoute on / redirects to /admin or /dashboard
```

### Password Reset Flow
```
User clicks "Forgot password" → /forgot-password
→ supabase.auth.resetPasswordForEmail(email, { redirectTo: '<app>/auth/callback' })
→ User clicks link in email → /auth/callback?type=recovery
→ AuthCallbackPage detects type=recovery → navigate to /reset-password
→ User enters new password
→ supabase.auth.updateUser({ password: newPassword })
→ Success → navigate to /login after 2.5s
```

### Session Persistence
- Supabase stores the JWT access token + refresh token in localStorage
- On page reload, `useAuthInit` calls `supabase.auth.getSession()` to restore state
- `onAuthStateChange` keeps the store in sync for the full session lifetime
- `auth.signOut()` clears the token and triggers `SIGNED_OUT` → store.logout()

---

## 12. Key Engineering Decisions

### 1. Cloudflare Worker as Network-Agnostic Proxy
**Problem:** Campus and corporate networks frequently block `*.supabase.co` via DNS or firewall.  
**Solution:** A 30-line Cloudflare Worker (`cloudflare/worker.js`) forwards all HTTP requests to the real Supabase URL, maintaining all original headers. The frontend uses the Worker URL as `VITE_SUPABASE_URL` — the app works identically on any network.

### 2. Database Trigger for Auto-Profile Creation
**Problem:** After `auth.signUp()`, there's no `profiles` row — any query that joins on `profiles` would fail.  
**Solution:** A PostgreSQL `SECURITY DEFINER` trigger function `handle_new_user()` fires after every INSERT into `auth.users` and creates the matching profile. This is bulletproof — even if a user registers through a different client, the profile is always created.

### 3. Routes Extracted to `src/routes.tsx`
**Why:** Keeping 35+ route definitions, lazy imports, and guard components in `App.tsx` would make it a 150+ line file. Moving them to a dedicated file keeps `App.tsx` as a clean 5-line entry point and makes the route tree easy to scan and modify.

### 4. Multi-Step Booking Persisted in Zustand (cartStore)
**Why:** A `useState` in `BookingPage.tsx` would lose progress if the user navigates away (e.g. to add an address and come back). Zustand with localStorage persistence means the draft survives page refreshes and navigation.

### 5. Lazy-Loaded Routes with Suspense Fallback
Every page component is wrapped in `React.lazy()`. The router renders a skeleton fallback while the chunk loads. This means the initial JS bundle is minimal — only the auth pages and shared components load upfront.

### 6. Role-Split Views in Single Components
`DashboardPage`, `DashboardBookingsPage`, and `BookingDetailPage` each render completely different UIs for different roles rather than having separate routes. This keeps the URL structure clean (`/dashboard` for everyone) while serving role-appropriate content.

### 7. TanStack Query for All Server State
No raw `useEffect` fetch calls exist in the codebase. Every Supabase query goes through React Query hooks. This gives: automatic caching, background refetch, loading/error states, and cache invalidation after mutations — for free.

---

## 13. Demo Accounts & Test Data

### Accounts (all passwords: `Demo@1234`)

| Role | Email | Name | Notes |
|---|---|---|---|
| Customer | customer1@demo.urbanease.in | Priya Sharma | Has 4 bookings (Pending, Confirmed, Completed, Cancelled) |
| Customer | customer2@demo.urbanease.in | Rahul Desai | Has 4 bookings (On the Way, In Progress, Completed, Rejected) |
| Provider | provider1@demo.urbanease.in | Meera Sharma | Skills: Beauty, Salon, Waxing; 5.0★ rating |
| Provider | provider2@demo.urbanease.in | Rajan Mehta | Skills: Plumbing, Painting, Electrical; 4.0★ rating |
| Admin | admin@demo.urbanease.in | Admin User | Full admin panel access |

### Seed Bookings

| ID prefix | Customer | Provider | Service | Status |
|---|---|---|---|---|
| f000...001 | Priya | — | Plumbing | Pending |
| f000...002 | Priya | Meera | AC Service | Confirmed |
| f000...003 | Rahul | Rajan | Deep Home Cleaning | On the Way |
| f000...004 | Rahul | Meera | Electrical | In Progress |
| f000...005 | Priya | Rajan | Full Body Waxing | Completed (reviewed) |
| f000...006 | Rahul | Meera | Home Painting | Completed (reviewed) |
| f000...007 | Priya | — | Pest Control | Cancelled |
| f000...008 | Rahul | Rajan | Salon at Home | Rejected |

### Seed Reviews
- Priya → Meera (5★): "Meera was absolutely professional! The waxing was done perfectly."
- Rahul → Meera (4★): "Rajan did a great job with the painting. Clean finish, no mess."

### Services in Database
| ID | Name | Category | Price | Duration |
|---|---|---|---|---|
| s1 | Full Body Waxing | Beauty & Salon | ₹649 | 60 min |
| s2 | Deep Home Cleaning | Home Cleaning | ₹1,299 | 180 min |
| s3 | AC Service & Gas Refill | AC & Appliances | ₹799 | 90 min |
| s4 | Plumbing Repair | Plumbing | ₹499 | 60 min |
| s5 | Electrical Repair | Electrical | ₹599 | 60 min |
| s6 | Home Painting | Painting | ₹4,999 | 480 min |
| s7 | Pest Control | Pest Control | ₹899 | 120 min |
| s8 | Salon at Home | Beauty & Salon | ₹399 | 45 min |
| s9 | Yoga & Wellness | Wellness | ₹699 | 60 min |

---

## 14. Project Setup Guide

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (free tier sufficient)
- Cloudflare account (only if on a restricted network)

### Step 1 — Clone & Install
```bash
git clone https://github.com/<username>/urbanEase.git
cd urbanEase
npm install
```

### Step 2 — Supabase Project Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Authentication → Settings** → disable **Email confirmations** (for dev/demo)
3. Go to **SQL Editor** → paste the full contents of `supabase/seed.sql` → click **Run**
   - This creates all tables, the auto-profile trigger, 5 demo auth users, and all seed data

### Step 3 — Environment Variables
Create `.env.local` in the project root:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
Both values are in Supabase Dashboard → Project Settings → API.

### Step 4 — Run the Dev Server
```bash
npm run dev
# App runs at http://localhost:5173
```

### Step 5 — Test with Demo Accounts
Navigate to `/login` → expand "Demo Accounts" panel → click "Fill" on any account → click "Sign In".

### Cloudflare Worker (restricted network only)
If `*.supabase.co` is blocked:
```bash
npm install -g wrangler
CLOUDFLARE_API_TOKEN=<your-token> npx wrangler deploy --config cloudflare/wrangler.toml
```
Then update `VITE_SUPABASE_URL` to the Worker URL shown after deployment.

### Available Scripts
```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Type-check + build for production
npm run preview   # Serve production build locally
npm run lint      # ESLint check
```

---

*UrbanEase v1.0*
