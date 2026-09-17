# SkillBridge web

React 19, React Router, Vite and strict TypeScript. The responsive interface follows the reference with a dark sidebar, purple/coral accents, soft backgrounds and an original SVG illustration.

```sh
npm install
npm run dev
```

Open **http://localhost:5173** with the Express API on port 4000. Vite proxies `/api`. Keep the browser origin consistent with backend `CLIENT_ORIGIN`.

Demo: `sarah@skillbridge.demo` / `SkillBridge123!` (requires backend demo seeding).

## Routes

`/`, `/login`, `/register`, `/dashboard`, `/explore`, `/sessions`, `/community`, `/resources`, `/resources/:id`, `/profile`, `/profile/:id`, `/settings`.

Learning-space routes require authentication. Tokens stay in HttpOnly cookies and are never stored in localStorage.

## Build

`npm run build` compiles TypeScript and builds `dist`. Serve with SPA history fallback and proxy `/api` to Express; see `nginx.conf`. Optional `VITE_API_URL` is the backend origin without `/api` (configure CORS/cookies to match your deployment).

`src/types.ts` defines response types, `src/api.ts` centralizes requests, `src/context.tsx` provides auth/data/toast helpers, and routes live in `src/pages`.

Google Fonts is optional, with system fallback. Illustrations/avatars do not depend on external image services. `agent-browser` is included for development verification.
