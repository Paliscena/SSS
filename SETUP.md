# SSS technical setup

Use Node.js 24 (see `.node-version`) and npm.

```sh
npm ci
npm run dev
```

The starter includes a basic counter to verify React interaction. Website design is intentionally deferred.

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
