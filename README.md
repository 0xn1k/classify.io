# SchoolOS

SchoolOS is a school operations platform for student records, attendance, fees,
communication, exams, reports, and administration.

## Service Setup

The service follows `docs/trd.md`:

```text
apps/api      Hono API service
apps/web      Next.js web app
prisma        Prisma schema and migrations
docs          Product, technical, and database requirements
```

Create `.env`, install dependencies, and generate the Prisma client:

```bash
make setup
```

Run both API and web app in development:

```bash
make dev
```

Or run them separately:

```bash
make dev-api
make dev-web
```

Run checks that do not require a database:

```bash
make verify
```

## Supabase Setup

SchoolOS uses Supabase for both PostgreSQL and Auth.

Set these values in `.env`:

```text
DATABASE_URL=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The web login page supports both sign in and create account. Creating the first
account uses Supabase Auth, then calls the API to create the local SchoolOS
school and principal user linked by `supabase_user_id`.

The API listens on `PORT` or `4000` by default and exposes:

```text
GET /health
GET /me
GET /dashboard/summary
GET /students
POST /students
GET /attendance/students
POST /attendance/students
GET /attendance/teachers
POST /attendance/teachers
```

Additional TRD route groups are scaffolded under `apps/api/src/modules`.
