# SSS technical setup

Use Node.js 24 (see `.node-version`) and npm.

```sh
npm ci
npm run dev
```

Version 1 is a functional studio portfolio. The home page is at `/`, and reusable detail pages are at `/work/:slug`. Project data is centralized in `src/data/projects.ts`; see `ASSETS.md` for placeholder replacement and licenses.

The navigation uses React Router. Cloudflare Pages provides SPA fallback automatically when no top-level `404.html` is present, including direct project links.

Version 2 is a five-section page based on the supplied creative direction. Hero, About, Selected Work, What We Do, and Contact are all on `/`. Edit studio copy and the offering groups in `src/data/studio.ts`. About is a concise draft awaiting final copy.

Work uses simple 16:9 grey placeholder tiles. In `src/data/projects.ts`, replace project titles, clients, thumbnails, and `videoUrl` with real YouTube or Vimeo HTTPS links. The viewer loads an embedded player only when a tile is opened. No autoplay, backend, or paid service is required. Blank or unsupported links show a clearly labeled placeholder viewer. Optional project detail routes remain available at `/work/:slug`.

The liquid hero is preserved in `backups/sss-liquid-v1` and `backups/sss-liquid-v1.zip`, including its frozen production build. Preview the backup with `npx vite preview --outDir backups/sss-liquid-v1/dist --port 4174`. To work on that version independently, extract its source to a separate folder and run `npm ci`.

The homepage question cycles through playful replies when clicked or activated by keyboard. Section reveals use IntersectionObserver with reduced-motion support. Navigation and video viewers use native modal dialogs for focus containment and Escape dismissal.

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
