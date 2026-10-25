# SmartHR — Employee Management & Leave Tracking System

MCA 3rd Semester project (Kurukshetra University) by **Ajay Kumar**  
Roll No. **10976147** · Enrollment **24DEOJULYMCA00126**

A full-stack, viva-ready web application for employee records, departments, leave approvals, attendance, and HR reports — with role-based access (Admin / HR / Employee).

## Why this project

An earlier API-only submission was difficult to demonstrate. SmartHR ships a **live UI + REST APIs + database + full MCA documentation** so you can explain and show every module.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Prisma ORM** + **SQLite** (portable demo DB)
- **JWT** session cookies (`jose`) + **bcrypt** passwords
- **Zod** validation · **Recharts** dashboards · **Tailwind CSS**

## Quick start

```bash
npm install
cp .env.example .env
npm run setup    # prisma generate + db push + seed
npm run dev      # http://127.0.0.1:43123
```

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smarthr.demo` | `Admin@123` |
| HR | `hr@smarthr.demo` | `Hr@12345` |
| Employee | `employee@smarthr.demo` | `Emp@12345` |

## Modules

| Module | What you can show in viva |
|--------|---------------------------|
| Dashboard | KPIs, headcount chart, attendance mix, recent activity |
| Employees | Search, filter, paginate, create/edit, soft-delete |
| Departments | Create departments, headcount, guarded delete |
| Leave Requests | Submit → pending → approve/reject with reviewer trail |
| Attendance | Day-wise presence with check-in/out |
| Reports | High-salary list, leave summary, dept salary averages |

## Documentation (for LMS / hard-bound report)

| File | Contents |
|------|----------|
| [`docs/01_SYNOPSIS_AND_ABSTRACT.md`](docs/01_SYNOPSIS_AND_ABSTRACT.md) | 3–4 page synopsis/abstract checklist |
| [`docs/02_MAIN_PROJECT_REPORT.md`](docs/02_MAIN_PROJECT_REPORT.md) | Full report chapters + annexures |
| [`docs/03_COVER_PAGE.md`](docs/03_COVER_PAGE.md) | Cover page template |
| [`docs/04_VIVA_DEMO_SCRIPT.md`](docs/04_VIVA_DEMO_SCRIPT.md) | Minute-by-minute demo + Q&A |

Copy the Markdown into Word, apply university fonts/margins (Times New Roman 12, double spacing, A4 margins), paste your signed certificates, and export PDF for LMS.

## Scripts

```bash
npm run dev        # development server on port 43123
npm run build      # production build
npm run start      # run production build
npm run db:reset   # wipe + reseed demo data
npm run lint       # ESLint
```

## Project layout

```
src/app/           # pages + API routes
src/components/    # UI + layout
src/lib/           # auth, db, helpers
prisma/            # schema + seed
docs/              # MCA report materials
```

## Deploy / GitHub

1. Create a GitHub repo and push this project.  
2. For a public demo, deploy to **Vercel** (add env `DATABASE_URL` + `JWT_SECRET`).  
   Note: SQLite on serverless is limited — for cloud demo prefer a free Postgres (e.g. Neon) and change Prisma `provider` to `postgresql`.  
3. Local/viva demo with SQLite is the recommended default.

## Student path on your PC

Clone or copy this repo to:

`C:\Users\91895\Documents\Code\DemoProjects\MCA_Sem3Assignment`

Then run the Quick start commands above in that folder.

## License

Academic / educational use for MCA project submission.
