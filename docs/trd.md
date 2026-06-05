# SchoolOS Technical Requirements Document

## 1. Document Information

| Field | Value |
| --- | --- |
| Product | SchoolOS |
| Version | 1.0 MVP |
| Document type | Technical Requirements Document |
| Frontend | Next.js in `apps/web` |
| Backend | Hono in `apps/api` |
| Database | PostgreSQL |
| ORM | Prisma in `prisma/schema.prisma` |
| Auth | Supabase Auth |
| UI | shadcn/ui, Tailwind CSS, icon-led minimal interface |

## 2. Technical Vision

SchoolOS will be built as a simple, modular school management platform with a clear separation between frontend, API, database, and authentication.

The system must be easy to maintain, predictable for a small engineering team, and scalable enough for a single school with 100 to 1000 students. The architecture should avoid unnecessary complexity while keeping clean boundaries around business modules such as students, teachers, attendance, fees, exams, communication, reports, and settings.

## 3. Architecture Principles

- Keep the product modular by domain, not by technical layer alone.
- Use Supabase Auth as the source of authentication identity.
- Use the application database as the source of business roles, permissions, and school data.
- Keep the API as the primary enforcement point for authorization and business rules.
- Use Prisma for database access and schema migrations.
- Keep frontend components simple, accessible, and reusable.
- Prefer server-validated workflows over trusting client-side checks.
- Audit every sensitive mutation.
- Optimize for clarity before abstraction.
- Design for a single-school MVP, while keeping IDs and ownership boundaries ready for future multi-school support.

## 4. Repository Structure

Expected structure:

```text
apps/
  web/
    app/
    components/
    lib/
    hooks/
    styles/
  api/
    src/
      modules/
      middleware/
      lib/
      routes/
prisma/
  schema.prisma
  migrations/
docs/
  prd.md
  trd.md
  database.md
```

## 5. High-Level System Architecture

```text
Browser
  -> Next.js Web App
    -> Hono API
      -> Supabase JWT validation
      -> RBAC permission checks
      -> Prisma ORM
        -> PostgreSQL

Supabase Auth
  -> User sign in
  -> JWT issued
  -> JWT sent to API
```

## 6. Frontend Requirements

### 6.1 Technology

- Next.js app located in `apps/web`.
- Tailwind CSS for styling.
- shadcn/ui for base components.
- Icons from a standard React icon library such as `lucide-react`.
- Supabase client for authentication session handling.

### 6.2 UI Direction

The UI should be minimal, simple, and operational. SchoolOS is an internal school operations product, so the interface should prioritize scanning, speed, and low cognitive load.

Design requirements:

- Use a clean dashboard layout with sidebar navigation.
- Keep pages dense but readable.
- Prefer tables, filters, tabs, dialogs, drawers, and forms over decorative sections.
- Use icon buttons for common actions such as edit, archive, receipt, download, send, view, and search.
- Use shadcn/ui components for buttons, inputs, selects, dialogs, dropdowns, tables, badges, cards, tabs, toasts, and date pickers.
- Use Tailwind utility classes consistently.
- Keep color usage restrained and meaningful.
- Use status badges for attendance, fee, leave, user, message, and student statuses.
- Provide clear empty states and loading states.
- Avoid marketing-style hero sections.

### 6.3 Frontend Routes

Recommended Next.js routes:

```text
/login
/dashboard
/students
/students/new
/students/[id]
/teachers
/teachers/new
/teachers/[id]
/attendance/students
/attendance/teachers
/leave
/fees
/fees/payments
/fees/receipts/[id]
/communication
/exams
/exams/[id]
/reports
/settings
/users
```

### 6.4 Frontend Responsibilities

- Render role-aware navigation.
- Handle Supabase Auth login, logout, and session refresh.
- Attach access token to API requests.
- Provide form validation for usability.
- Display server validation errors.
- Keep business-critical validation on the API.
- Use shared API client utilities.
- Use optimistic UI only for low-risk interactions.

## 7. Backend Requirements

### 7.1 Technology

- Hono API located in `apps/api`.
- Prisma client for database access.
- Supabase JWT verification for authentication.
- PostgreSQL as primary database.

### 7.2 API Responsibilities

- Authenticate incoming requests.
- Load application user from Supabase user ID.
- Enforce RBAC permissions.
- Enforce business rules.
- Validate request payloads.
- Execute Prisma queries and mutations.
- Write audit logs for sensitive changes.
- Return consistent API responses and errors.

### 7.3 Backend Module Structure

Recommended module layout:

```text
apps/api/src/
  index.ts
  lib/
    prisma.ts
    supabase.ts
    errors.ts
    validation.ts
  middleware/
    auth.ts
    require-permission.ts
    audit-context.ts
  modules/
    dashboard/
    students/
    teachers/
    attendance/
    leave/
    fees/
    communication/
    exams/
    reports/
    users/
    settings/
    audit/
```

### 7.4 API Conventions

Use REST-style endpoints for the MVP.

Response shape:

```json
{
  "data": {},
  "error": null
}
```

Error shape:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {}
  }
}
```

Common HTTP status usage:

- `200` for successful reads and updates.
- `201` for created resources.
- `400` for invalid input.
- `401` for unauthenticated requests.
- `403` for missing permissions.
- `404` for missing resources.
- `409` for duplicate or conflicting data.
- `500` for unexpected server errors.

## 8. Authentication

### 8.1 Supabase Auth

Supabase Auth will manage:

- User signup or invitation identity.
- Login.
- Password reset.
- Session refresh.
- JWT issuance.

The application database will store a local `users` record linked to Supabase by `supabase_user_id`.

### 8.2 Auth Flow

```text
User logs in through Next.js
  -> Supabase Auth validates credentials
  -> Supabase returns session and access token
  -> Next.js sends access token to Hono API
  -> Hono validates token
  -> Hono loads local user by supabase_user_id
  -> Hono checks role and permissions
  -> Request continues or fails
```

### 8.3 Authorization

Authorization is handled by application RBAC.

Requirements:

- API middleware must require authentication for protected routes.
- API middleware must verify required permissions per route.
- Teachers must be restricted to assigned classes, sections, and subjects for attendance and marks workflows.
- Principal role gets full access.
- Inactive users must be denied access even if Supabase authentication succeeds.

## 9. RBAC Design

### 9.1 Entities

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`

### 9.2 Default Roles

- Principal
- Teacher
- Accountant
- Receptionist

### 9.3 Permission Enforcement

Every protected route must declare required permissions. Example:

```text
POST /students -> MANAGE_STUDENTS
GET /students -> VIEW_STUDENTS
POST /attendance/students -> MARK_STUDENT_ATTENDANCE
POST /fees/payments -> COLLECT_PAYMENTS
POST /communication/notifications -> SEND_NOTIFICATIONS
```

## 10. Core API Routes

### 10.1 Auth and Current User

```text
GET /me
PATCH /me
```

### 10.2 Dashboard

```text
GET /dashboard/summary
```

### 10.3 Students

```text
GET /students
POST /students
GET /students/:id
PATCH /students/:id
PATCH /students/:id/status
GET /students/:id/history
GET /students/:id/attendance
GET /students/:id/fees
GET /students/:id/results
```

### 10.4 Teachers

```text
GET /teachers
POST /teachers
GET /teachers/:id
PATCH /teachers/:id
PATCH /teachers/:id/status
GET /teachers/:id/assignments
POST /teachers/:id/assignments
DELETE /teacher-assignments/:id
```

### 10.5 Attendance

```text
GET /attendance/students
POST /attendance/students
PATCH /attendance/students/:id
GET /attendance/teachers
POST /attendance/teachers
PATCH /attendance/teachers/:id
```

### 10.6 Leave

```text
GET /leave-requests
POST /leave-requests
PATCH /leave-requests/:id/approve
PATCH /leave-requests/:id/reject
```

### 10.7 Fees

```text
GET /fee-categories
POST /fee-categories
GET /fee-plans
POST /fee-plans
GET /students/:id/fee-ledger
POST /payments
GET /payments
GET /receipts/:id
GET /fees/reports/collection
GET /fees/reports/defaulters
```

### 10.8 Communication

```text
GET /notifications
POST /notifications
GET /notifications/:id
GET /notifications/:id/logs
```

### 10.9 Exams and Results

```text
GET /exams
POST /exams
GET /exams/:id
PATCH /exams/:id
POST /exams/:id/subjects
GET /marks
POST /marks
PATCH /marks/:id
POST /exams/:id/generate-results
POST /exams/:id/publish-results
GET /results/students/:studentId
```

### 10.10 Reports

```text
GET /reports/students
GET /reports/admissions
GET /reports/attendance
GET /reports/teacher-attendance
GET /reports/teacher-leave
GET /reports/class-performance
GET /reports/student-performance
GET /reports/subject-performance
```

### 10.11 Settings

```text
GET /settings/school
PATCH /settings/school
GET /settings/academic-years
POST /settings/academic-years
GET /settings/classes
POST /settings/classes
GET /settings/sections
POST /settings/sections
GET /settings/subjects
POST /settings/subjects
GET /settings/communication
PATCH /settings/communication
```

### 10.12 Users

```text
GET /users
POST /users
GET /users/:id
PATCH /users/:id
PATCH /users/:id/status
GET /roles
POST /roles
GET /permissions
POST /users/:id/roles
DELETE /users/:id/roles/:roleId
```

## 11. Prisma and Database Requirements

### 11.1 Prisma

Prisma schema location:

```text
prisma/schema.prisma
```

Requirements:

- Use PostgreSQL provider.
- Use UUID primary keys for main entities.
- Use enums for stable statuses.
- Use decimal type for money.
- Use timestamps on all core tables.
- Use soft status changes for students, teachers, and users instead of deleting important records.
- Add indexes for search and frequent filters.

### 11.2 PostgreSQL

PostgreSQL stores all application data except Supabase Auth's managed identity tables.

Core database design is documented in `docs/database.md`.

## 12. Audit Logging

Audit logging is required for:

- Student create, update, status change.
- Teacher create, update, status change.
- Attendance create and update.
- Leave approval or rejection.
- Fee payment collection.
- Receipt creation.
- Exam result generation and publication.
- Marks changes.
- User role and permission changes.
- Settings changes.

Audit logs must include actor, action, entity type, entity ID, before value, after value, IP address where available, user agent where available, and timestamp.

## 13. Communication Integration

### 13.1 WhatsApp

The MVP uses WhatsApp as the only delivery channel.

Implementation requirements:

- Store message request in `notifications`.
- Store recipient-level delivery status in `notification_logs`.
- Support queued, sent, delivered, and failed statuses.
- Keep provider configuration in settings.
- Do not block the main UI while provider delivery is in progress.

### 13.2 Provider Abstraction

Create a simple communication service interface so the actual WhatsApp provider can be changed later.

```text
sendMessage(recipientPhone, message, metadata)
```

## 14. Reporting Requirements

Reports should be API-generated using database queries and filters. MVP reports do not require a custom report builder.

Required filters:

- Academic year
- Date range
- Class
- Section
- Student
- Teacher
- Fee status
- Exam
- Subject

Reports must respect RBAC and teacher assignment restrictions.

## 15. Validation Rules

Global rules:

- Required fields must be validated on API.
- Duplicate records must return `409`.
- Date ranges must reject end dates before start dates.
- Money values must be greater than or equal to zero unless explicitly allowed.
- Marks obtained cannot exceed maximum marks.
- Phone numbers should be normalized before storage where practical.

Critical uniqueness:

- `users.supabase_user_id`
- `users.email`
- `students.admission_number`
- `teachers.phone`
- `receipts.receipt_number`
- One student attendance record per student and date.
- One teacher attendance record per teacher and date.

## 16. Non-Functional Requirements

### 16.1 Performance

- Common pages should load within 2 seconds under MVP data volume.
- Student search should respond within 2 seconds for 1000+ students.
- Attendance save should complete within 2 seconds for one class.
- Dashboard summary should use optimized aggregate queries.

### 16.2 Security

- Supabase JWT must be validated on protected API routes.
- Passwords are managed by Supabase Auth.
- API must enforce RBAC server-side.
- Sensitive settings must not be exposed to the frontend.
- Audit logs should be append-only at application level.
- Use HTTPS in production.

### 16.3 Reliability

- Fee payment and receipt creation must happen in one database transaction.
- Attendance bulk save must use a transaction.
- Result generation must use a transaction.
- Notification delivery failures must not delete original notification records.

### 16.4 Maintainability

- Keep modules small and domain-focused.
- Keep validation schemas near route handlers or module services.
- Keep Prisma access inside module services.
- Avoid duplicating permission checks in frontend-only code.

## 17. Environment Variables

### 17.1 Web

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

### 17.2 API

```text
DATABASE_URL=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
WHATSAPP_SENDER_ID=
```

## 18. Implementation Phases

### Phase 1: Foundation

- Monorepo setup.
- Next.js app setup.
- Hono API setup.
- Prisma setup.
- Supabase Auth integration.
- RBAC schema and middleware.
- Basic layout and navigation.

### Phase 2: Core Operations

- Students.
- Teachers.
- Teacher assignments.
- Student attendance.
- Teacher attendance.
- Leave management.

### Phase 3: Finance and Communication

- Fee categories and plans.
- Ledgers.
- Payments and receipts.
- Defaulter reports.
- WhatsApp notifications.

### Phase 4: Academics and Reports

- Exams.
- Exam subjects.
- Marks entry.
- Result generation.
- Student, attendance, fee, teacher, and exam reports.

### Phase 5: Settings and Hardening

- School settings.
- Academic configuration.
- Communication settings.
- Audit log views.
- Performance indexes.
- Production readiness.

## 19. MVP Technical Acceptance Criteria

The MVP is technically complete when:

- Next.js app runs from `apps/web`.
- Hono API runs from `apps/api`.
- Prisma schema exists in `prisma/schema.prisma`.
- PostgreSQL migrations can create all MVP tables.
- Supabase Auth login works from the frontend.
- API validates Supabase JWTs.
- API maps Supabase users to local users.
- RBAC permissions are enforced on protected API routes.
- Principal can access all MVP modules.
- Teacher access is restricted to assigned workflows.
- Accountant can manage fees and reports.
- Receptionist can manage student onboarding workflows.
- Fee payment and receipt creation are transactional.
- Attendance and result workflows prevent duplicate or invalid records.
- Sensitive mutations write audit logs.
- UI uses shadcn/ui, Tailwind CSS, and icons consistently.
