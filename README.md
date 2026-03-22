# TTPSSWA

Next.js (App Router) + TypeScript + Tailwind CSS site for [TTPSSWA](https://github.com/9802dool/TTPSSWA).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Customize

- **Metadata & title:** `app/layout.tsx`
- **Home page copy & sections:** `app/page.tsx`
- **Header / footer:** `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- **Colors:** CSS variables in `app/globals.css`

## Deploy

Push to GitHub and import the repo in [Vercel](https://vercel.com) (or Netlify, etc.). The build command is `npm run build` and output is the Next.js standalone/serverless target your host expects.
