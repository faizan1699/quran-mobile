# Quran Mobile

Expo / React Native mobile app for the Taleem-ul-Quran platform (Islam360-style: Quran, prayer times, duas, audio). The backend + admin web live in a separate repo: [`quran-web`](https://github.com/faizan1699/quran-web).

This app is **standalone** — it talks to the backend purely over HTTP (`/api/v1`) and has no monorepo dependencies.

## Getting Started

```bash
# Install dependencies
pnpm install     # or npm install

# Copy env (point API_BASE_URL at your running backend)
cp .env.example .env

# Start the Expo dev server
pnpm dev         # expo start
```

Then:

| Command | What |
|---|---|
| `pnpm dev` / `pnpm start` | Expo dev server (press `w` for web, `a` Android, `i` iOS) |
| `pnpm android` | Run on Android device/emulator |
| `pnpm ios` | Run on iOS simulator |
| `pnpm build` | Type-check (`tsc --noEmit`) |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest |

## Backend connection

`src/services/apiClient.ts` defaults to `http://localhost:3000/api/v1` (auto-maps to `10.0.2.2` on Android emulator). Override via `API_BASE_URL` in `.env`.

## Shared types

The API contract types live in [`src/types/shared-types.ts`](src/types/shared-types.ts), vendored from `quran-web`'s `packages/shared-types`. Imported app-wide via the `@shared-types` alias. If the backend contract changes, re-copy that file.

## Structure

```
src/
  components/   Reusable UI
  screens/      App screens
  navigation/   React Navigation setup
  services/     API client + data services
  hooks/        React Query hooks
  store/        Zustand stores
  theme/        Theming (light/dark/system)
  tokens/       Design tokens
  i18n/         en / ur translations
  types/        Shared + asset type declarations
```
