# LivBizz — Coworking & Conference Hub

> **A full-stack booking platform for coworking spaces, day passes, and meeting rooms.**
> Built with Next.js 16, Supabase, and Prisma.

<!-- ------------------------------------------------------------------------ -->
## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

<!-- ------------------------------------------------------------------------ -->
## Overview

LivBizz is a production-grade SaaS platform that enables users to discover, book, and manage coworking spaces and conference rooms across multiple campuses. The platform supports real-time availability checking, QR-code-based check-ins, role-based dashboards, and audit logging for compliance.

### Core Capabilities

- **Landing & Marketing** — Responsive landing page with SEO metadata, animated hero section, 3D scroll gallery, auto-scrolling reviews carousel, and interactive feature cards.
- **Booking Engine** — Time-slot-based availability system with conflict detection, seat capacity management, and instant QR ticket generation.
- **Authentication & Authorization** — Supabase Auth with magic link and email/password flows; role-based access control (User, Admin, Super Admin).
- **QR Check-In** — Signed QR codes for tickets with server-side verification at the door.
- **Admin Dashboard** — Booking management, user administration, audit log viewer, manual booking override, and real-time statistics.
- **Email Notifications** — Transactional emails for booking confirmations, password resets, and check-in receipts via Nodemailer.
- **Error Monitoring** — Integrated Sentry for client-side and server-side error tracking.

<!-- ------------------------------------------------------------------------ -->
## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 (App Router)                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Marketing │  │ Booking      │  │ Dashboard │  │ Admin     │  │
│  │ Pages     │  │ Flow         │  │ (User)    │  │ Panel     │  │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘  │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │   API Routes        │                            │
│              │  (REST / JSON)      │                            │
│              └──────────┬──────────┘                            │
├─────────────────────────┼───────────────────────────────────────┤
│              ┌──────────┴──────────┐                            │
│              │   Supabase Client   │                            │
│              │   (SSR + Service)   │                            │
│              └──────────┬──────────┘                            │
├─────────────────────────┼───────────────────────────────────────┤
│              ┌──────────┴──────────┐                            │
│              │    PostgreSQL       │                            │
│              │  (via Prisma ORM)   │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

<!-- ------------------------------------------------------------------------ -->
## Tech Stack

| Layer              | Technology                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| **Framework**      | [Next.js 16.2.6](https://nextjs.org) (App Router)                       |
| **UI Library**     | [React 19.2](https://react.dev)                                         |
| **Language**       | TypeScript 5                                                            |
| **Database ORM**   | [Prisma 6](https://www.prisma.io)                                       |
| **Database**       | PostgreSQL 15 (via [Supabase](https://supabase.com))                     |
| **Auth**           | [Supabase Auth](https://supabase.com/auth) (SSR-compatible)             |
| **Styling**        | CSS Modules + CSS Layers (Cascade Layers)                               |
| **Icons**          | [Lucide React](https://lucide.dev)                                      |
| **Validation**     | [Zod 4](https://zod.dev)                                                |
| **Email**          | [Nodemailer](https://nodemailer.com)                                    |
| **Monitoring**     | [Sentry](https://sentry.io)                                             |
| **QR Codes**       | [qrcode](https://github.com/soldair/node-qrcode)                        |
| **Caching**        | [lru-cache](https://github.com/isaacs/node-lru-cache)                   |
| **Animation**      | Lottie (lottie-react) + CSS Scroll-Driven Animations                    |

### Key Design Decisions

- **CSS Modules with Cascade Layers** — Each component co-locates its styles in a `.module.css` file. The global stylesheet (`globals.css`) uses `@layer` (reset → base → theme → components → utilities) for predictable specificity.
- **Supabase SSR** — Uses `@supabase/ssr` for server-side cookie-based sessions, compatible with Next.js App Router middleware and server components.
- **Signed QR Tickets** — Each booking generates a cryptographically signed ticket URL using `TICKET_SIGNING_SECRET`. The check-in endpoint verifies the signature before admitting the user.
- **Audit Logging** — All admin mutations (create booking, update user role, etc.) are logged to an `AuditLog` table with timestamps, actor ID, target, and diff data for compliance.

<!-- ------------------------------------------------------------------------ -->
## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL database (Supabase project recommended)
- A Supabase project with Auth enabled
- SMTP credentials (for transactional emails)
- Sentry DSN (optional, for error tracking)

### Installation

```bash
git clone <repo-url>
cd pleasant-biz
cp .env.example .env
```

Edit `.env` with your Supabase credentials, database URL, SMTP settings, and generate a `TICKET_SIGNING_SECRET`:

```bash
openssl rand -base64 32
```

```bash
npm install
npx prisma generate
npx prisma db push        # or: npx prisma migrate dev
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start development server (Next.js)           |
| `npm run build`     | Generate Prisma client + production build    |
| `npm run start`     | Start production server                      |
| `npm run lint`      | Run ESLint across the project                |

<!-- ------------------------------------------------------------------------ -->
## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── admin/                  # Admin dashboard (bookings, users, audit)
│   ├── api/                    # API route handlers (REST endpoints)
│   │   ├── admin/              #   Admin-only endpoints
│   │   ├── auth/               #   Auth (me, callback, password reset)
│   │   ├── bookings/           #   Booking CRUD + ticket verification
│   │   ├── dashboard/          #   User dashboard data
│   │   └── slots/              #   Slot availability
│   ├── book/                   # Booking flow (day-pass / meeting-room)
│   ├── checkin/                # QR ticket check-in page
│   ├── dashboard/              # User dashboard (my bookings, settings)
│   ├── login/                  # Authentication pages
│   ├── reset-password/         # Password reset flow
│   ├── tickets/                # Public ticket details (by code)
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Landing / marketing page
│   ├── globals.css             # Design tokens & base styles
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
│
├── components/                 # Reusable UI components
│   ├── Navbar.tsx              #  Navigation bar + mobile hamburger menu
│   ├── Hero.tsx                #  Animated hero with SVG illustration
│   ├── BookCtaBanner.tsx       #  Booking call-to-action cards
│   ├── PremiumCampuses.tsx     #  3D carousel of workspace photos
│   ├── DayInTheLife.tsx        #  Interactive stacked card deck
│   ├── GoogleReviews.tsx       #  Auto-scrolling reviews marquee
│   ├── Footer.tsx              #  Site footer with watermark
│   ├── LocationMap.tsx         #  Map + contact info card
│   ├── booking/                #  Booking-specific components
│   └── *.module.css            #  Co-located CSS Modules per component
│
├── lib/                        # Shared utilities
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # Supabase server/client helpers
│   ├── supabase/               # Supabase SSR configuration
│   ├── email.ts                # Nodemailer transport
│   ├── tickets.ts              # QR ticket signing & verification
│   ├── schemas.ts              # Zod validation schemas
│   ├── audit.ts                # Audit log writer
│   ├── cache.ts                # LRU cache wrapper
│   ├── rate-limiter.ts         # API rate limiting
│   ├── logger.ts               # Structured logger
│   └── validation.ts           # Shared validation helpers
│
├── instrumentation.ts          # Sentry instrumentation
└── proxy.ts                    # Supabase proxy configuration
```

### Conventions

- **Components** are co-located with their CSS Module (e.g., `Hero.tsx` + `Hero.module.css`).
- **API routes** follow the pattern `/api/<resource>/<action>`.
- **Page segments** in `app/` mirror the URL structure.
- **Shared logic** lives in `lib/` — no business logic in components.
- **CSS** uses Cascade Layers (`@layer`) for predictable overrides.

<!-- ------------------------------------------------------------------------ -->
## Key Features

### Booking Engine
- Real-time slot availability with capacity tracking.
- Conflict detection — overlapping bookings for the same desk/slot are rejected.
- Supports hourly and full-day units per slot.
- QR-code ticket generation with cryptographic signing.

### Authentication & Authorization
- Supabase Auth with email/password and magic link (SSR-compatible).
- Session persisted via HTTP‑only cookies.
- Three roles: `USER`, `ADMIN`, `SUPER_ADMIN`.
- Protected API routes and page segments via middleware.

### Admin Dashboard
- **Bookings** — View, filter, and manage all bookings. Manual booking override supported.
- **Users** — List, search, and update user roles.
- **Audit Log** — Immutable log of all admin actions with timestamps and IP.
- **Statistics** — Daily/weekly booking counts, revenue, and user growth metrics.

### QR Check-In
- Signed ticket URLs prevent forgery.
- Check-in page validates signature, ticket status, and validity window.
- Supports one-time scan and marks ticket as used.

### Marketing Landing Page
- Animated hero section with custom SVG illustration.
- 3D scroll-driven carousel of workspace photos.
- Auto-scrolling Google Reviews marquee (Apple-style cards).
- Interactive card deck (DayInTheLife section).
- Fully responsive with scroll-margin-aware anchor navigation.

<!-- ------------------------------------------------------------------------ -->
## Data Model

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────>│ Booking  │────>│  Ticket  │
└──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
                  ┌──────────┐     ┌──────────┐
                  │   Slot   │────>│  Campus  │
                  └──────────┘     └──────────┘

┌──────────────┐
│  AuditLog    │  (immutable ledger)
└──────────────┘
```

### Models

| Model       | Description                                        |
| ----------- | -------------------------------------------------- |
| **User**    | Supabase-authenticated user with name, phone, role |
| **Campus**  | Physical location (name, address, map URL)         |
| **Slot**    | Bookable resource (type, capacity, price)          |
| **Booking** | User reservation linking a user to a slot/timeslot |
| **Ticket**  | Individual seat ticket with QR code and status     |
| **AuditLog**| Immutable record of admin actions                  |

See `prisma/schema.prisma` for full field definitions.

<!-- ------------------------------------------------------------------------ -->
## API Reference

### Public Endpoints

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| GET    | `/api/slots`                      | List available slots            |
| GET    | `/api/slots/availability`         | Check slot availability         |
| GET    | `/api/slots/booked-seats`         | Get booked seats for a slot     |
| POST   | `/api/bookings/create`            | Create a new booking            |
| GET    | `/api/bookings/verify-ticket`     | Verify a QR ticket code         |
| GET    | `/api/auth/me`                    | Get current user session        |

### Auth Endpoints

| Method | Endpoint                             | Description              |
| ------ | ------------------------------------ | ------------------------ |
| POST   | `/api/auth/signup`                   | Register new user        |
| GET    | `/api/auth/callback`                 | OAuth/callback handler   |
| POST   | `/api/auth/forgot-password`          | Request password reset   |
| POST   | `/api/auth/reset-password`           | Reset password           |

### Admin Endpoints (require ADMIN or SUPER_ADMIN)

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/admin/bookings`           | List all bookings        |
| GET    | `/api/admin/users`              | List all users           |
| PATCH  | `/api/admin/users`              | Update user role         |
| GET    | `/api/admin/stats`              | Platform statistics      |
| GET    | `/api/admin/audit-logs`         | Audit log                |
| GET    | `/api/admin/verify`             | Manual ticket verification|
| POST   | `/api/admin/desk-qr`            | Generate desk QR code    |

<!-- ------------------------------------------------------------------------ -->
## Deployment

### Build

```bash
npm run build
```

This runs `prisma generate` followed by `next build`. The output is a standalone Next.js server in `.next/`.

### Environment Variables

All required variables are documented in `.env.example`. Ensure the following are set in production:

- `DATABASE_URL` — PostgreSQL connection string.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project credentials.
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side Supabase admin key.
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL (used for OG tags, emails).
- `TICKET_SIGNING_SECRET` — 32-byte base64 secret for QR ticket signing.
- `EMAIL_*` — SMTP credentials for transactional emails.
- `SENTRY_DSN` — Sentry project DSN (optional).

### Hosting

This app is designed to run on any Node.js hosting platform (Vercel, Railway, Fly.io, etc.). Supabase provides the database and auth backend.

<!-- ------------------------------------------------------------------------ -->
## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Lucide Icons](https://lucide.dev/icons)
- [Zod Validation](https://zod.dev)

<!-- ------------------------------------------------------------------------ -->
## Contributing

1. Create a feature branch from `main`.
2. Make your changes.
3. Ensure the project builds: `npm run build`.
4. Run the linter: `npm run lint`.
5. Open a pull request with a description of the change.

All commits should follow conventional commit messages.

<!-- ------------------------------------------------------------------------ -->
## License

**Private** — All rights reserved. This source code is proprietary and not licensed for public use, modification, or distribution.
