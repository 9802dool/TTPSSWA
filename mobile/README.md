# TTPSSWA mobile app

Native shell for **TTPSSWA** that loads your existing Next.js site in a **WebView**. One codebase for the website; the app adds installability, a branded header, reload, and “open in browser”.

## Requirements

- Node.js 20+
- For device testing: [Expo Go](https://expo.dev/go) on your phone, or Android Studio / Xcode for emulators

## Configure the URL

1. Copy `.env.example` to `.env` in this folder.
2. Set `EXPO_PUBLIC_SITE_URL` to your deployed site (e.g. `https://your-project.vercel.app`) **or** your dev machine URL (see below).

Restart the dev server after changing `.env`.

## Run locally

```bash
cd mobile
npm install
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` for emulator.

### Point the app at local Next.js

1. Start the web app: from the repo root, `npm run dev` (default `http://localhost:3000`).
2. Use your computer’s **LAN IP** so the phone can reach it, e.g. `http://192.168.1.10:3000`.
3. Set `EXPO_PUBLIC_SITE_URL` to that URL in `.env`.

**Android only:** plain `http://` to a dev server may require cleartext traffic; use HTTPS (e.g. tunnel) or configure native cleartext for dev builds.

## Build store binaries

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli login
cd mobile
eas build:configure
eas build --platform android
eas build --platform ios
```

Or from `mobile`:

- **`npm run build:ios`** — production iPhone/iPad build (installable IPA / TestFlight / App Store).
- **`npm run build:ios:sim`** — iOS **Simulator** build (preview profile; good for quick Mac testing, not for devices).

### iPhone (iOS) notes

- **Apple Developer Program** (paid) is required for TestFlight and App Store; EAS can manage signing certificates when you follow the prompts.
- `app.json` sets `ios.bundleIdentifier` to `org.ttpsswa.app` and export compliance via `ITSAppUsesNonExemptEncryption` for App Store Connect.
- Update `ios.bundleIdentifier` and `android.package` if you publish under different IDs.

### Monorepo + GitHub / EAS (“package.json does not exist in …/mobile”)

This repo is **Next.js at the root** and **Expo in `mobile/`**.

1. **Expo dashboard → your project → [GitHub settings](https://expo.dev)**  
   Set **Base directory** to **`mobile`** (not empty, not `/`). That tells EAS where `package.json` and `app.json` live after the repo is cloned.

2. **Push `mobile/` to GitHub**  
   EAS clones your remote; anything not committed/pushed is missing on the builder. Run `git status` and push `main` (or your build branch).

3. **Confirm the linked repo** is **`TTPSSWA`** (or whichever repo actually contains the `mobile` folder).

## Project layout

| Path | Purpose |
|------|---------|
| `App.tsx` | Header, WebView, loading and error UI |
| `src/config.ts` | Reads `EXPO_PUBLIC_SITE_URL` |

## Future upgrades

- Replace the WebView with **React Navigation** + API-driven screens for offline-first flows.
- Add **push notifications** (Expo Notifications) after a backend is available.
- Share types or API client with the Next.js app in a monorepo package.
