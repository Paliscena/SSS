# SSS technical setup

Use Node.js 24 (see `.node-version`) and npm.

```sh
npm ci
npm run dev
```

Version 1 is a functional studio portfolio. The home page is at `/`, and reusable detail pages are at `/work/:slug`. Project data is centralized in `src/data/projects.ts`; see `ASSETS.md` for placeholder replacement and licenses.

The navigation uses React Router. Cloudflare Pages provides SPA fallback automatically when no top-level `404.html` is present, including direct project links.

The hero uses a WebGL2 liquid displacement field with a static heading fallback and reduced-motion support. It captures touch gestures only over the type stage. See `LIQUID-HERO.md` for architecture, development-only tuning controls, and recovery settings. Other section reveals use IntersectionObserver. The desktop cursor supplements the normal pointer. The menu uses a native modal dialog for focus containment and Escape dismissal.

## Verification

```sh
npm run lint
npm run build
npm run preview
```

The build checks TypeScript and writes the production site to `dist/`.

## Cloudflare Pages

Connect `Paliscena/SSS` using the Cloudflare Pages Git integration:

- Production branch: `main`
- Framework preset: React (Vite)
- Root directory: repository root
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24` (set `NODE_VERSION=24` if needed)

Cloudflare installs dependencies before building. No application secrets or environment variables are required. Creating the Pages project and connecting the Git integration are separate deployment steps.

Reference: https://developers.cloudflare.com/pages/configuration/build-configuration/
