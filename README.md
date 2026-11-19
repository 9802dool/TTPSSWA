# TTPSSWA web

Next.js site and API for the Trinidad & Tobago Police Service Social & Welfare Association. Deploy this folder as its **own** Vercel project (separate from your portfolio).

## Deploy on Vercel

1. Open [Vercel](https://vercel.com) → **Add New…** → **Project** → import your Git repository (the same repo that contains `TTPSSWA/`).
2. Under **Root Directory**, set **`TTPSSWA`** (not the repository root).
3. Deploy. Vercel runs `npm install` and `npm run build` inside `TTPSSWA/`.

### Environment variables (production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Optional PostgreSQL connection string for the Prisma membership-application models |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Online accounts, member applications, admin stats, hotel bookings, session-backed features |
| `ADMIN_PASSWORD` | Admin login (min 8 characters); also used to derive member session signing if `MEMBER_SESSION_SECRET` is unset |
| `MEMBER_SESSION_SECRET` | Optional; dedicated secret for member cookies (≥ 8 chars) |
| `RESEND_API_KEY` | Transactional email (membership pending, hotel notifications) |
| `HOTEL_BOOKING_NOTIFY_EMAIL` | Inbox for new hotel reservation requests |
| `BOOKING_FROM_EMAIL` / `MEMBERSHIP_FROM_EMAIL` | Resend “from” addresses (must be allowed in Resend) |
| `MOBILE_WEB_ORIGINS` | Comma-separated `https://…` origins allowed to call `/api/*` from the browser (Expo web on another Vercel URL). No trailing slashes. Example: `https://v0-mobile-app-for-ttpsswa-ipcq4567y.vercel.app` |
| `MOBILE_WEB_ALLOW_ALL_VERCEL` | Set to `1` to allow any `https://*.vercel.app` origin (handy for previews; prefer an explicit `MOBILE_WEB_ORIGINS` list in production) |

Add any other keys you already use locally (e.g. Twilio for WhatsApp) via **Settings → Environment Variables**.

### Launch switches

Hotel booking, membership services, member signup/login, and the admin area are **off** until you set the matching variable and redeploy. The pages and API routes stay in the repo. With a switch off:

- Navigation, the home page, the footer, and the Subsidiaries Noel Chase card do not link to that section.
- Visiting a switched-off page shows a Coming soon page with the office phone numbers (235-5260 / 792-6226). Hotel pages also include WhatsApp for hotel enquiries: https://wa.me/18687926226
- API routes for that section return `503` with `{ "error": "This service is not available." }` and do not process submissions.
- Those URLs are left out of the sitemap.

| Variable | Set to `true` to turn on | What it covers |
|----------|--------------------------|----------------|
| `ENABLE_HOTEL` | Hotel reservations | `/hotel-reservations`, `/noel-chase-hotel-and-conference-centre`, `/api/hotel/book`, `/api/hotel-availability`, `/api/hotel-booking` (including quotation open), and the hotel performance cron |
| `ENABLE_MEMBERSHIP_SERVICES` | Membership services | `/membership-services` and every benefit page, `/legal-aid-application`, `/dental-optical-grant`, `/retirement-benefit-application`, `/merit-loan-application`, and the legal aid, dental/optical, retirement, merit loan, merit salary deduction, and upload signed-URL APIs |
| `ENABLE_MEMBERSHIP_SIGNUP` | Become a member, signup, and login | `/become-a-member`, `/membership-form`, `/membership-registration`, `/salary-deduction`, `/register`, `/login`, `/members/login`, `/members-portal`, `/verify-email`, `/member/dashboard`, `/services/membership-application`, plus auth register/verify/resend/session, members login/logout, member-signup, salary deduction, membership apply, and member document upload/view APIs |
| `ENABLE_ADMIN` | Admin area | `/admin` and every `/admin/*` page, `/unauthorized`, and `/api/admin/*` (login, check-bootstrap, and the rest) |

Accepted on-values are `true`, `1`, `yes`, and `on` (any other value, or leaving the variable unset, keeps the section off). On Vercel, add the variable under **Settings → Environment Variables**, then start a **new deployment** so the build picks it up. Turning a section back on does not require a code change.

Home, About, Executive team, Central Committee Representatives, Committees, Subsidiaries (without the hotel link while `ENABLE_HOTEL` is off), Partnership, Rule Book, and Privacy Policy stay available either way.

### Expo web + “Network error” / failed API calls

If the mobile web app is on a different domain than this site, the browser blocks API responses unless CORS is enabled. After setting `MOBILE_WEB_ORIGINS` or `MOBILE_WEB_ALLOW_ALL_VERCEL=1` on **this** (TTPSSWA) Vercel project, redeploy.

If the **mobile** Vercel URL returns **401** in the browser, open that project on Vercel → **Settings → Deployment Protection** and turn off protection for the deployment you want public (or use a password your testers know).

## Point the native Expo app at this API

In `ttpsswa-mobile/.env` (local dev or EAS builds):

```bash
EXPO_PUBLIC_API_BASE_URL=https://YOUR-TTPSSWA-PROJECT.vercel.app
```

No trailing slash.

To deploy the **Expo web** build as its own Vercel project (separate from this site and from your portfolio), see [`ttpsswa-mobile/README.md`](../ttpsswa-mobile/README.md).

## Local dev

```bash
cd TTPSSWA
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001) so it does not clash with the portfolio on port 3000. Copy `.env.example` to `.env.local` if you add one for local secrets.

With `DATABASE_URL` set, apply Prisma tables:

```bash
npx prisma migrate deploy
```
