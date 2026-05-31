# LivBizz — Coworking & Conference Hub

A full-stack booking platform for coworking spaces, day passes, and meeting rooms.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=flat-square&logo=neon&logoColor=black)

## Features

- **Interactive Floor Plan** — SVG-based seat selection with pan & zoom
- **Booking Wizards** — Day pass and meeting room booking flows
- **Digital Tickets** — QR-coded passes with self check-in
- **Admin Panel** — Approve/reject bookings, manage users, verify tickets
- **Email Notifications** — Branded confirmation emails with ticket details
- **Audit Logging** — Tracks all admin actions for compliance
- **Role-Based Access** — Client, Admin, Super Admin roles

## Tech Stack

| Category | Tools |
|:--|:--|
| Framework | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | NextAuth.js, bcrypt.js |
| Validation | Zod |
| Email | Nodemailer |
| UI | CSS Modules, Lucide Icons, Lottie Animations |
| Utilities | QRCode, date-fns, LRU Cache, React Day Picker |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL, NEXTAUTH_SECRET, and email credentials

# 3. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate deploy

# 4. Seed the database (creates admin user & sample data)
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Admin Login

```
Email: admin@livbizz.com
Password: password@123
```

## Project Structure

```
src/
├── app/           # Pages & API routes (Next.js App Router)
│   ├── admin/     # Admin dashboard, bookings, users, verify
│   ├── book/      # Day pass & meeting room booking wizards
│   ├── dashboard/ # User dashboard, bookings history, settings
│   ├── api/       # REST API endpoints
│   └── ...
├── components/    # Reusable UI components
├── lib/           # Utilities (auth, email, cache, audit, etc.)
prisma/
├── schema.prisma  # Database schema
├── seed.js        # Database seeder
└── migrations/    # Migration history
```

## License

Private — All rights reserved.
