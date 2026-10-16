# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"Wine for Service" — registration site for a Rotary Club Chiari charity dinner (Italian-language UI and copy). Public landing page with a registration form, plus a password-protected admin page to manage registrations. Next.js App Router + Neon Postgres, no ORM.

## Commands

```bash
npm run dev      # dev server (.claude/launch.json uses: npx next dev -p 3111)
npm run build
npm start
npm run lint     # eslint
```

No test framework is configured. Setup: copy `.env.example` to `.env.local`.

## Next.js version warning

`AGENTS.md` states this Next.js (16.x, React 19.3) has breaking changes versus training data: read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code. `next.config.ts` enables `cacheComponents` and `partialPrefetching`, and wires Tailwind v4 via `@tailwindcss/turbopack` for `*.css`.

## Architecture

- **Event constants** live in `lib/config.ts` (`EVENT`): name, date, venue, price per person, max per registration, IBAN/bank details, contact. Edit here (not in components) to change event details; `MAX_SEATS` env var overrides `maxSeats` (0 = unlimited). These values are also used in the confirmation email.
- **Database** (`lib/db.ts`): `@neondatabase/serverless` tagged-template `sql`. `db()` lazily runs `CREATE TABLE IF NOT EXISTS registrations` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` once per process — there is no migration tool, so schema changes are added as idempotent statements there. `mapRow` converts `importo` (NUMERIC → string) to number. The `Registration` type is shared with the client admin page.
- **Registration flow** (`app/api/register/route.ts`): zod validation → honeypot field `website` (bots get a fake success) → seat-limit check → insert with a random `WFS-XXXXX` code (retries on collision) → `sendConfirmation`. Amount is computed server-side (`partecipanti * pricePerPerson`); `altri` holds the other guests' names (count = partecipanti − 1).
- **Email** (`lib/mail.ts`): SMTP via nodemailer if `SMTP_USER`/`SMTP_PASS` set (`SMTP_HOST` defaults to Gmail), otherwise Resend if `RESEND_API_KEY` + `MAIL_FROM`. Never throws — email failure must not fail a registration. Sending is OFF unless `SEND_CONFIRMATION_EMAIL=true` (the club could not provide a sender mailbox). Event email is BCC'd. (SMTP_* vars are not in `.env.example`.)
- **Admin auth** (`lib/auth.ts`): single shared `ADMIN_PASSWORD` (timing-safe compare) → HS256 JWT (`jose`, signed with `SESSION_SECRET`) in an httpOnly `wfs_admin` cookie, 12h. Every `app/api/admin/*` route must call `isAdmin()` itself; there is no middleware.
- **Admin UI** (`app/admin/page.tsx`): client component that fetches `/api/admin/registrations`, treats a 401 as "show login form". Excel export at `/api/admin/export` (exceljs); per-row updates at `/api/admin/registrations/[id]` (payment status, admin notes).
- **Frontend**: `app/page.tsx` (landing, custom wine/gold/ivory Tailwind theme in `app/globals.css`) and `components/RegistrationForm.tsx`. Path alias `@/` → project root.

## Repo layout note

This project sits in `C:\Sviluppo\Sviluppo_NET\Rotary\` next to the source PDF flyer and `Giacenza.xlsx`; the git repo is rooted in `wine-for-service/`.
