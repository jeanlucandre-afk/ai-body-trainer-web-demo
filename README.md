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

Production can use the same-origin `/api/*` proxy automatically. You can also set the explicit API base:

```bash
VITE_API_BASE_URL=https://ai-body-trainer-web-demo.vercel.app
npm run dev
```

The web deployment proxies `/api/*` to the backend in `vercel.json`, so production falls back to the web origin when `VITE_API_BASE_URL` is empty. Local real-link testing still needs `VITE_API_BASE_URL`; fixture-only development should use `VITE_DEMO_MODE=true`.

## Build

```bash
npm run build
```
