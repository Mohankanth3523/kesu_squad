# Kesh Squad

**Welcome, Amigos! — Watch. Talk. Connect.**

A community platform for MBBS and BDS students: videos, discussions, a second-hand textbook marketplace, and free book donations with an Honour Board.

> **Status: Milestone A, Step 2 — complete frontend prototype.** All data is sample data kept in your browser (localStorage). There is no backend and no real login; messages you write are never delivered to anyone. A banner on every page says so.

Planning documents live in [`docs/`](docs/).

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 works)
- npm

## Commands

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:5173
npm run build      # type-check, then build to dist/
npm run preview    # serve the production build locally
npm run typecheck  # type-check only
```

## Trying the prototype

- `/` shows the intro on your first visit; `/welcome` always shows it.
- `/login` → **Continue as demo_amigo** (has sample listings, donations, requests and chats), **Demo admin**, or **Guest**.
- `/signup` creates a local demo profile. Only the display name and course are kept — never the email or password.
- Try: sell a book (live price cap), message a seller, post and comment, upvote, request a donation,
  accept/send/complete a donation in **Dashboard → My donations**, and watch the Honour Board update.
- **Dashboard → Settings → Reset prototype data** restores the original sample data.
- `/dev/ui` is the design-system page (buttons, forms, modal, toasts, states, icons).
- Add `?mockError=all` to any URL to see error states, or `?mockEmpty=all` for empty states.
  Target one call with its key, e.g. `/books?mockError=books.search`. `?mockLatency=0` removes the simulated delay.

## Stack

React · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Lucide React · React Router.
Supabase and Cloudflare Pages arrive in later milestones (see `docs/TECHNICAL_ARCHITECTURE.md`).

## Folder structure

```
src/
  app/            App, router, layouts, route guards, providers (mock session)
  components/
    ui/           design-system primitives (Button, Card, Badge, Field, Modal, Toast, Icon, …)
    layout/       header, mobile menu, tab bar, footer, page header, banners, route errors
  pages/          one file per route, grouped by area
  features/       feature-specific components (content, community, books, donations, inbox, dashboard)
  domain/         validation rules and constants shared by forms and services
  services/
    interfaces/   service contracts — the only data API the UI uses
    mock/         mock implementations + in-browser database (Milestone A)
    index.ts      picks the implementation from VITE_DATA_SOURCE
  data/           seed data (fictional people, books, posts, chats), shaped like the database tables
  hooks/          useAsync, useDocumentTitle, useOnlineStatus
  types/          domain types, service errors, display labels
  lib/            routes, navigation, formatting, pricing rules, safe storage, env
  styles/         Tailwind entry and design tokens
public/           favicon, Cloudflare Pages _redirects and _headers
```

## Environment

Copy `.env.example` to `.env.local`. Only `VITE_DATA_SOURCE=mock` is supported in Milestone A.
Never put secrets in `VITE_*` variables — they are bundled into the public site.
