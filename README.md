# TTPSSWA web

Next.js site and API for the Trinidad & Tobago Police Service Social & Welfare Association. Deploy this folder as its **own** Vercel project (separate from your portfolio).

## Deploy on Vercel

1. Open [Vercel](https://vercel.com) → **Add New…** → **Project** → import your Git repository (the same repo that contains `TTPSSWA/`).
2. Under **Root Directory**, set **`TTPSSWA`** (not the repository root).
3. Deploy. Vercel runs `npm install` and `npm run build` inside `TTPSSWA/`.

### Environment variables (production)

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Member applications, admin stats, hotel bookings, session-backed features |
| `ADMIN_PASSWORD` | Admin login (min 8 characters); also used to derive member session signing if `MEMBER_SESSION_SECRET` is unset |
| `MEMBER_SESSION_SECRET` | Optional; dedicated secret for member cookies (≥ 8 chars) |
| `RESEND_API_KEY` | Transactional email (membership pending, hotel notifications) |
| `HOTEL_BOOKING_NOTIFY_EMAIL` | Inbox for new hotel reservation requests |
| `BOOKING_FROM_EMAIL` / `MEMBERSHIP_FROM_EMAIL` | Resend “from” addresses (must be allowed in Resend) |
| `MOBILE_WEB_ORIGINS` | Comma-separated `https://…` origins allowed to call `/api/*` from the browser (Expo web on another Vercel URL). No trailing slashes. Example: `https://v0-mobile-app-for-ttpsswa-ipcq4567y.vercel.app` |
| `MOBILE_WEB_ALLOW_ALL_VERCEL` | Set to `1` to allow any `https://*.vercel.app` origin (handy for previews; prefer an explicit `MOBILE_WEB_ORIGINS` list in production) |

Add any other keys you already use locally (e.g. Twilio for WhatsApp) via **Settings → Environment Variables**.

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
