# AI Body Trainer Web Demo

High-fidelity web/PWA demo of the AI Body Trainer iOS concept. It mirrors the SwiftUI prototype flows for teammates who do not have a Mac or Xcode.

## Run Locally

```bash
npm install
VITE_API_BASE_URL=http://localhost:4000 npm run dev
```

To run fixture-only demo mode without the backend:

```bash
VITE_DEMO_MODE=true npm run dev
```

## Required Environment

Production requires:

```bash
VITE_API_BASE_URL=https://ai-body-trainer-web-demo.vercel.app
npm run dev
```

The web deployment proxies `/api/*` to the backend in `vercel.json`, so production uses the web origin as its API base. Do not leave `VITE_API_BASE_URL` empty for real WhatsApp links.

## Build

```bash
npm run build
```
