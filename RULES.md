# UrbanEase - Development Rules & Guidelines

## 1. UI/UX & Styling Rules
- **Color Palette:** Primary (Indigo `#4F46E5`), Accent (Amber `#F59E0B`), Surface (White/Slate).
- **Typography:** Inter (sans-serif) for a clean, modern look.
- **Mobile First:** All layouts must be designed for 375px screens first and enhanced for tablet/desktop using Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`).
- **Tailwind Restrictions:** Strictly use Tailwind classes. Do NOT write custom CSS unless absolutely necessary (e.g., complex animations).
- **Component Library:** Utilize `shadcn/ui` for primitive UI components (Forms, Dialogs, Badges, Tabs, Toasts). Avoid reinventing basic controls.
- **Aesthetics First:** The design must look extremely premium, mimicking high-end apps like Urban Company. Use soft shadows, rounded corners (`rounded-xl` or `rounded-2xl`), and subtle Framer Motion micro-interactions.

## 2. Component Architecture Rules
- Use functional components and modern React Hooks.
- Ensure components are broken down logically. A single file should rarely exceed 300 lines of code.
- Extract repeated logic into custom hooks (e.g., `useAuth`, `useServices`).
- Avoid "prop drilling." Use Zustand for global UI state (like modals or multi-step form progress) or React Context when appropriate.

## 3. Data Fetching & State Rules
- **Server State:** Strictly use `TanStack Query` (React Query) for API calls (Supabase integration). Do not use plain `useEffect` for fetching unless it's a very specific edge case.
- **Caching & Optimistic Updates:** Implement optimistic updates for actions like "Booking a service" or "Cancelling a booking".
- **Form State:** All forms must use `React Hook Form` combined with `Zod` for validation schemas. Do not use uncontrolled vanilla forms.

## 4. Supabase Rules
- Ensure Row Level Security (RLS) is taken into account when writing clientside queries.
- Use the auto-generated TypeScript types provided by the Supabase CLI (`Database` interface). Do not manually type query responses if the generated types suffice.
- Subscribe to Realtime updates only where necessary (e.g., live booking status). Make sure to unsubscribe on component unmount.

## 5. Git & Commit Conventions
- Commit messages must be clear and descriptive.
- **CRITICAL:** Do NOT include any mentions of "AI", "AI generated", or the agent's name in the commit messages or code comments. Keep the commits looking like natural human development.
- Recommended format: `feat: add booking confirmation modal` or `fix: resolve mobile layout overflow in services grid`.
