# Kaghan Naran · Valley Directory

A Next.js 15 + Supabase website and admin panel for the Kaghan valley, from Balakot to Babusar Top. It is built for **Pine Travel (SMC-Private) Limited**.

It runs right away in **demo mode** with sample data, so nothing needs to be set up first. Connect Supabase when you're ready to go live.

```bash
npm install
npm run dev        # http://localhost:3000  (demo mode)
```

In demo mode you are signed in as a demo admin. Open `/admin` to see the admin panel. All buttons work, but nothing is saved.

---

## What's inside

**Public website** (`app/(site)`)
- **Home page:**
  - 3D valley fly-through (React Three Fiber) with the Kunhar river, snowfall and stop markers
  - Animated headline and search
  - Live road-status board with split-flap animation
  - Live weather from Open-Meteo, a free service that needs no API key
- **Route explorer:** all **19 stops and 73 places** from your list, with *New* badges and safety warnings
- **Infographics:** count-up stats, an elevation profile that draws itself, and a chart of places per stop
- **More home sections:**
  - Directory grouped by type
  - Featured listings
  - Lake and viewpoint tiles with a parallax effect
  - Film section: a cinematic slideshow that plays your YouTube/Vimeo/mp4 link once it's set in Settings
  - Trails, services, jobs and events
- **Other pages:**
  - `/places` and `/places/[stop]`
  - `/directory`, with filters for type, stop and search
  - `/listing/[slug]`, with Call and WhatsApp buttons
  - `/trails`, `/road`, `/community`, `/community/post`, `/list-your-business` and `/credits`
- **English + اردو:** a switch in the top bar flips the whole layout to right-to-left.
- **Accounts:** sign-up for travellers, business owners and individual tour guides.

**Business and guide submission with approval**
- 14 business types, each with **its own form fields, required documents and moderator checklist**. Examples: hotel, guest house, camping, restaurant, shop, jeep operator, tour guide (individual), tour company, adventure (zip line, rafting and others), fuel/mechanic, plus staff-only types: health, police, bank/ATM and government offices.
- A 5-step sign-up wizard with document and photo upload. CNICs and licences go to a **private** storage bucket that only the owner and staff can open.
- Statuses: `pending → approved / changes_requested / rejected → suspended`. Every decision is logged, and the owner is notified.
- If an owner edits an approved listing, it automatically goes back for review. The database stops owners from approving, featuring or verifying their own listings.

**Admin panel** (`app/admin`)
- **Dashboard:** key figures, a submissions-vs-approvals chart, a type donut, the status funnel, a queue of submissions waiting more than 48 hours, listings per stop, road status and activity.
- **Approval queue:** tabs per business type, document completeness, checklist progress and how long each submission has waited.
- **Review workspace:** a checklist for that type, a document viewer with signed links that expire after 10 minutes, the Verified badge, ready-made notes, Approve / Request changes / Reject / Suspend, a history timeline, and auto-advance to the next submission.
- **Other admin pages:**
  - All listings, where you can feature, verify or delete
  - Tour guides
  - Events & jobs moderation
  - **Places & stops editor**
  - Trails editor
  - **Road status editor** with a live preview
  - **Business types & rules editor**: fields, documents and checklists
  - Users & roles
  - Activity log
  - Settings: alert banner, film URL, emergency numbers and moderation switches

---

## Going live (about 15 minutes)

1. **Create a Supabase project** at supabase.com. The free tier is enough to start.
2. **Create the database.** Open the SQL editor, then run in order:
   - `supabase/migrations/0001_init.sql` (tables, security rules, storage buckets)
   - `supabase/seed.sql` (the 19 stops and places, 16 trails, 14 business types, road segments)
3. **Add your keys.** Copy `.env.example` to `.env.local` and fill in values from *Project Settings → API*:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...      # server only
   NEXT_PUBLIC_SITE_URL=https://your-domain.pk
   ```
4. **Set the sign-in redirect.** Go to Supabase → *Authentication → URL configuration*, set the Site URL, and add `https://your-domain.pk/auth/callback` as a redirect.
5. **Make yourself admin.** Sign up on the site, then run in SQL:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
6. **Deploy** on Vercel: import the repo and add the same environment variables.

If you edit places or business types in `lib/seed/` before launch, run `npm run seed:sql` to rebuild `supabase/seed.sql`. After launch, edit them in the admin panel instead.

---

## Things to replace before launch

- **Photos:** these are free Wikimedia Commons stock images loaded by URL (`lib/media.ts`), credited on `/credits`. Replace them with your own photos. Each stop's cover image can be changed in *Admin → Places & stops*.
- **Film:** add your YouTube, Vimeo or mp4 link in *Admin → Settings*.
- **Altitudes:** only Balakot, Kaghan, Naran, Lulusar, Babusar Top and Shogran have heights, and they are approximate. The elevation chart fills in between them.
- **Placeholders:** `[your-email]` in the footer and listing pages, the Privacy page text, and the WhatsApp road-alert form (`components/site/AlertSignup.tsx` has a TODO to connect your SMS/WhatsApp provider).
- **Sample data:** sample listings, jobs and events appear in demo mode only. They are never written to your database.

## Project map

```
app/(site)/        public pages          app/admin/          admin panel
components/home/   3D hero, explorer…    components/admin/   queue, review, editors, charts
lib/seed/          stops, types, trails  lib/actions/        server actions (submit, moderate, auth)
lib/data.ts        data layer (Supabase or demo)   supabase/   SQL schema + seed
```
