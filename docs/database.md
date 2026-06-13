# SchoolOS Database Design

## 1. Document Information

| Field | Value |
| --- | --- |
| Product | SchoolOS |
| Version | 1.0 MVP |
| Database | PostgreSQL |
| ORM | Prisma |
| Schema file | `prisma/schema.prisma` |
| Auth identity source | Supabase Auth |

## 2. Database Architecture Principles

- Keep the MVP schema small and easy to implement.
- Use PostgreSQL as the source of truth for SchoolOS business data.
- Use Supabase Auth for login identity and store the linked application profile in `users`.
- Use UUID primary keys for core entities.
- Use enums for stable statuses, roles, and payment methods.
- Use `Decimal` for fee, payment, and marks values.
- Use `Json` columns for low-risk MVP configuration where a separate table would add more complexity than value.
- Keep historical operational records instead of hard deleting important data.
- Use `created_at` and `updated_at` on mutable tables.
- Design the MVP for one school, but keep `school_id` on business tables so future multi-school support is possible.

## 3. Common Column Conventions

Recommended common columns:

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key. |
| `school_id` | UUID | Owning school. Useful even in single-school MVP. |
| `created_at` | Timestamp | Record creation timestamp. |
| `updated_at` | Timestamp | Last update timestamp. |
| `created_by` | UUID nullable | User who created the record. |
| `updated_by` | UUID nullable | User who last updated the record. |

Recommended Prisma mappings:

```prisma
id        String   @id @default(uuid()) @db.Uuid
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

## 4. Enums

Recommended enums:

```text
UserRole: PRINCIPAL, TEACHER, ACCOUNTANT, RECEPTIONIST
UserStatus: ACTIVE, INACTIVE
StudentStatus: ACTIVE, INACTIVE, LEFT, GRADUATED
TeacherStatus: ACTIVE, INACTIVE
AttendanceStatus: PRESENT, ABSENT, LEAVE, LATE
TeacherAttendanceStatus: PRESENT, ABSENT, LEAVE
LeaveStatus: PENDING, APPROVED, REJECTED
FeeFrequency: ONE_TIME, MONTHLY, ANNUAL, CUSTOM
FeeLedgerStatus: DUE, PARTIAL, PAID, WAIVED, CANCELLED
PaymentMethod: CASH, UPI, BANK_TRANSFER
NotificationAudienceType: ALL_PARENTS, CLASS_WISE, SECTION_WISE, FEE_DEFAULTERS, TEACHERS
NotificationCategory: GENERAL_NOTICE, FEE_REMINDER, EXAM_NOTIFICATION
NotificationStatus: DRAFT, QUEUED, SENT, DELIVERED, PARTIAL_FAILED, FAILED
ExamType: UNIT_TEST, QUARTERLY, HALF_YEARLY, ANNUAL
ExamStatus: DRAFT, SCHEDULED, COMPLETED, RESULT_PUBLISHED
AuditAction: CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, REJECT, LOGIN, LOGOUT, PAYMENT_COLLECTED, RESULT_PUBLISHED
```

## 5. Simplified MVP Tables

The MVP uses 18 tables instead of the earlier 32-table normalized design. The goal is to reduce joins, migrations, seed data, and admin screens while keeping the core workflows usable.

| # | Table | Purpose |
| --- | --- | --- |
| 1 | `schools` | School profile and app-level settings. |
| 2 | `users` | Login-linked app users with one MVP role. |
| 3 | `academic_years` | Academic year setup. |
| 4 | `classes` | Class and section setup in one table. |
| 5 | `subjects` | Subject master data. |
| 6 | `students` | Student profile, parent details, placement, and fee plan link. |
| 7 | `teachers` | Teacher profile and optional login link. |
| 8 | `teacher_assignments` | Teacher to class, section, and subject assignment. |
| 9 | `student_attendance` | Daily student attendance. |
| 10 | `teacher_attendance` | Daily teacher attendance. |
| 11 | `leave_requests` | Teacher leave request and review workflow. |
| 12 | `fee_plans` | Fee category and amount configuration. |
| 13 | `fee_ledgers` | Student dues, paid amount, balance, and status. |
| 14 | `payments` | Payment and receipt details in one record. |
| 15 | `exams` | Exam setup and subject mark configuration. |
| 16 | `marks` | Student marks by exam and subject. |
| 17 | `notifications` | Message campaign, recipients, templates, and provider result summary. |
| 18 | `audit_logs` | Append-only records for sensitive actions. |

## 5.1 `schools`

Purpose: Stores school identity, contact information, and simple app settings.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `name` | Text | Yes | School name. |
| `logo_url` | Text | No | School logo URL. |
| `address` | Text | No | School address. |
| `phone` | Text | No | School phone number. |
| `email` | Text | No | School email. |
| `communication_config` | Json | No | Non-secret WhatsApp/provider settings and reusable message templates. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Primary key on `id`.

Security note:

- Do not store raw API secrets in `communication_config`. Use environment variables or a managed secret store.

## 5.2 `users`

Purpose: Stores application users linked to Supabase Auth identities. MVP uses one role per user instead of separate role and permission tables.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `supabase_user_id` | UUID | Yes | Supabase Auth user ID. |
| `name` | Text | Yes | User display name. |
| `email` | Text | Yes | User email. |
| `phone` | Text | No | User phone number. |
| `role` | UserRole | Yes | Principal, Teacher, Accountant, or Receptionist. |
| `status` | UserStatus | Yes | User account status. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `supabase_user_id`.
- Unique index on `email`.
- Index on `school_id`, `role`, and `status`.

## 5.3 `academic_years`

Purpose: Stores configured academic years.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `name` | Text | Yes | Academic year label, for example `2026-2027`. |
| `start_date` | Date | Yes | Academic year start date. |
| `end_date` | Date | Yes | Academic year end date. |
| `is_active` | Boolean | Yes | Whether this is the active academic year. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.
- Index on `school_id` and `is_active`.

## 5.4 `classes`

Purpose: Stores class and section combinations in one table, such as Class 8 - A.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `name` | Text | Yes | Class name, for example `Class 8`. |
| `section` | Text | Yes | Section name, for example `A`. |
| `sort_order` | Integer | No | Display order. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id`, `name`, and `section`.

## 5.5 `subjects`

Purpose: Stores subjects taught in the school.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `name` | Text | Yes | Subject name. |
| `code` | Text | No | Optional subject code. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.

## 5.6 `students`

Purpose: Stores student profile, class placement, lifecycle status, and parent or guardian contact details in one table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `fee_plan_id` | UUID nullable | No | References `fee_plans.id`. |
| `photo_url` | Text | No | Student photo URL. |
| `name` | Text | Yes | Student full name. |
| `admission_number` | Text | Yes | Unique admission number. |
| `date_of_birth` | Date | No | Student date of birth. |
| `gender` | Text | No | Student gender. |
| `roll_number` | Text | No | Class roll number. |
| `admission_date` | Date | Yes | Admission date. |
| `status` | StudentStatus | Yes | Student lifecycle status. |
| `father_name` | Text | No | Father's name. |
| `mother_name` | Text | No | Mother's name. |
| `guardian_name` | Text | No | Guardian name. |
| `parent_phone` | Text | Yes | Primary parent or guardian phone. |
| `alternate_phone` | Text | No | Alternate contact phone. |
| `address` | Text | No | Student or guardian address. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |
| `created_by` | UUID nullable | No | References `users.id`. |
| `updated_by` | UUID nullable | No | References `users.id`. |

Indexes and constraints:

- Unique index on `school_id` and `admission_number`.
- Unique index on `academic_year_id`, `class_id`, and `roll_number` where roll number exists.
- Index on `school_id` and `status`.
- Index on `class_id`.
- Index on `parent_phone`.

## 5.7 `teachers`

Purpose: Stores teacher profiles and employment status.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `user_id` | UUID nullable | No | References `users.id` if the teacher can log in. |
| `photo_url` | Text | No | Teacher photo URL. |
| `name` | Text | Yes | Teacher full name. |
| `phone` | Text | Yes | Teacher phone number. |
| `email` | Text | No | Teacher email. |
| `joining_date` | Date | No | Joining date. |
| `status` | TeacherStatus | Yes | Teacher status. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `phone`.
- Unique index on `user_id` where present.
- Index on `school_id` and `status`.

## 5.8 `teacher_assignments`

Purpose: Links teachers to class-section records and subjects.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `teacher_id` | UUID | Yes | References `teachers.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `subject_id` | UUID | Yes | References `subjects.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `teacher_id`, `class_id`, `subject_id`, and `academic_year_id`.
- Index on `class_id`.
- Index on `subject_id`.

## 5.9 `student_attendance`

Purpose: Stores daily attendance status for students.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `date` | Date | Yes | Attendance date. |
| `status` | AttendanceStatus | Yes | Attendance status. |
| `marked_by` | UUID | Yes | References `users.id`. |
| `notes` | Text | No | Optional notes. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id`, `student_id`, and `date`.
- Index on `school_id`, `class_id`, and `date`.
- Index on `school_id`, `date`, and `status`.
- Index on `student_id` and `date`.
- Index on `school_id`, `academic_year_id`, and `date`.

## 5.10 `teacher_attendance`

Purpose: Stores daily attendance status for teachers.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `teacher_id` | UUID | Yes | References `teachers.id`. |
| `date` | Date | Yes | Attendance date. |
| `status` | TeacherAttendanceStatus | Yes | Attendance status. |
| `marked_by` | UUID | Yes | References `users.id`. |
| `notes` | Text | No | Optional notes. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id`, `teacher_id`, and `date`.
- Index on `school_id` and `date`.
- Index on `school_id`, `date`, and `status`.
- Index on `teacher_id` and `date`.

## 5.11 `leave_requests`

Purpose: Stores teacher leave requests and Principal review decisions.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `teacher_id` | UUID | Yes | References `teachers.id`. |
| `from_date` | Date | Yes | Leave start date. |
| `to_date` | Date | Yes | Leave end date. |
| `reason` | Text | Yes | Leave reason. |
| `status` | LeaveStatus | Yes | Leave request status. |
| `reviewed_by` | UUID nullable | No | References `users.id`. |
| `review_note` | Text | No | Approval or rejection note. |
| `reviewed_at` | Timestamp | No | Review timestamp. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `teacher_id`.
- Index on `school_id` and `status`.
- Check that `to_date >= from_date`.

## 5.12 `fee_plans`

Purpose: Stores fee category, amount, and frequency in one table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `class_id` | UUID nullable | No | Optional class-specific fee plan. |
| `category` | Text | Yes | Fee category, for example Admission Fee or Monthly Fee. |
| `name` | Text | Yes | Fee plan name. |
| `amount` | Decimal | Yes | Fee amount. |
| `frequency` | FeeFrequency | Yes | Fee frequency. |
| `is_active` | Boolean | Yes | Whether the plan is active. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.
- Index on `class_id`.
- Index on `category`.

## 5.13 `fee_ledgers`

Purpose: Stores student payable items, due amounts, paid amounts, and status.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `fee_plan_id` | UUID nullable | No | References `fee_plans.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `period_label` | Text | No | Period label such as January or Term 1. |
| `due_date` | Date | No | Due date. |
| `amount_due` | Decimal | Yes | Amount due. |
| `amount_paid` | Decimal | Yes | Amount paid so far. |
| `balance` | Decimal | Yes | Remaining balance. |
| `status` | FeeLedgerStatus | Yes | Ledger status. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `student_id`.
- Index on `school_id` and `status`.
- Index on `due_date`.

## 5.14 `payments`

Purpose: Stores payment, ledger allocation, and receipt data in one table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `fee_ledger_id` | UUID nullable | No | Main ledger item paid. Keep nullable for advance or mixed payments. |
| `allocation_details` | Json | No | Optional list of ledger IDs and allocated amounts for mixed payments. |
| `amount` | Decimal | Yes | Payment amount. |
| `payment_method` | PaymentMethod | Yes | Payment method. |
| `payment_date` | Date | Yes | Payment date. |
| `reference_number` | Text | No | UPI or bank reference number. |
| `receipt_number` | Text | Yes | Unique receipt number. |
| `receipt_date` | Date | Yes | Receipt date. |
| `collected_by` | UUID | Yes | References `users.id`. |
| `notes` | Text | No | Optional payment notes. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `receipt_number`.
- Index on `student_id`.
- Index on `fee_ledger_id`.
- Index on `payment_date`.
- Payment amount must be greater than zero.

## 5.15 `exams`

Purpose: Stores exam definitions and subject mark configuration. MVP keeps subject setup in JSON to avoid an `exam_subjects` table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `name` | Text | Yes | Exam name. |
| `type` | ExamType | Yes | Exam type. |
| `start_date` | Date | Yes | Exam start date. |
| `end_date` | Date | Yes | Exam end date. |
| `status` | ExamStatus | Yes | Exam status. |
| `subject_config` | Json | Yes | Subject IDs, maximum marks, and optional pass marks. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `academic_year_id`, `class_id`, and `name`.
- Index on `school_id` and `status`.
- Check that `end_date >= start_date`.

## 5.16 `marks`

Purpose: Stores student marks for exam subjects. Result totals and percentages can be calculated from this table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `exam_id` | UUID | Yes | References `exams.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `subject_id` | UUID | Yes | References `subjects.id`. |
| `marks_obtained` | Decimal | Yes | Marks obtained by student. |
| `maximum_marks` | Decimal | Yes | Maximum marks at time of entry. |
| `entered_by` | UUID | Yes | References `users.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `exam_id`, `student_id`, and `subject_id`.
- Index on `student_id`.
- Marks obtained must not exceed maximum marks.

## 5.17 `notifications`

Purpose: Stores message campaigns, selected recipients, message body, and provider delivery summary in one table.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `category` | NotificationCategory | Yes | Message category. |
| `audience_type` | NotificationAudienceType | Yes | Audience selection type. |
| `title` | Text | No | Internal title. |
| `message` | Text | Yes | Message body. |
| `recipients` | Json | No | Recipient IDs, phone numbers, and delivery status details. |
| `status` | NotificationStatus | Yes | Campaign delivery status. |
| `provider_response` | Json | No | Provider result summary or error details. |
| `created_by` | UUID | Yes | References `users.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `school_id` and `category`.
- Index on `status`.
- Index on `created_by`.

## 5.18 `audit_logs`

Purpose: Stores append-only audit records for sensitive actions.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID nullable | No | References `schools.id`. |
| `actor_user_id` | UUID nullable | No | References `users.id`. |
| `action` | AuditAction | Yes | Audit action. |
| `entity_type` | Text | Yes | Entity type, for example `student` or `payment`. |
| `entity_id` | UUID nullable | No | Changed entity ID. |
| `before_value` | Json | No | Previous value snapshot. |
| `after_value` | Json | No | New value snapshot. |
| `ip_address` | Text | No | Request IP address. |
| `user_agent` | Text | No | Request user agent. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Index on `school_id`.
- Index on `actor_user_id`.
- Index on `entity_type` and `entity_id`.
- Index on `created_at`.

## 6. Removed or Merged Tables

| Old table | MVP decision |
| --- | --- |
| `roles` | Replaced by `users.role`. |
| `permissions` | Replaced by application-level permission rules mapped to `UserRole`. |
| `role_permissions` | Removed for MVP. |
| `user_roles` | Removed because each user has one MVP role. |
| `sections` | Merged into `classes.section`. |
| `parents` | Merged into parent and guardian fields on `students`. |
| `fee_categories` | Merged into `fee_plans.category`. |
| `payment_allocations` | Merged into `payments.allocation_details` JSON. |
| `receipts` | Merged into `payments.receipt_number` and `payments.receipt_date`. |
| `exam_subjects` | Merged into `exams.subject_config` JSON. |
| `results` | Removed; result summaries are calculated from `marks`. |
| `notification_logs` | Merged into `notifications.recipients` and `notifications.provider_response`. |
| `message_templates` | Merged into `schools.communication_config`. |
| `communication_settings` | Merged into `schools.communication_config`. |

## 7. Transaction Requirements

Use database transactions for:

- Payment collection, ledger updates, and receipt number creation.
- Attendance bulk save.
- Marks bulk entry.
- Leave approval when teacher attendance or leave reporting needs synchronization.

## 8. Search and Reporting Indexes

Recommended indexes:

- `students.name`
- `students.admission_number`
- `students.parent_phone`
- `teachers.name`
- `teachers.phone`
- `student_attendance.school_id`, `class_id`, `date`
- `student_attendance.school_id`, `date`, `status`
- `teacher_attendance.school_id`, `date`
- `teacher_attendance.school_id`, `date`, `status`
- `fee_ledgers.status`
- `fee_ledgers.due_date`
- `payments.payment_date`
- `payments.receipt_number`
- `exams.status`
- `notifications.status`

For better search later, PostgreSQL trigram indexes can be added for student and teacher names.

## 9. Prisma Implementation Notes

- Use Prisma `@@map` and `@map` if database table names use snake_case.
- Use Prisma `Decimal` for money and marks.
- Use explicit relation names when a table references `users` more than once.
- Add compound unique constraints for attendance, marks, assignments, and receipts.
- Keep enum names stable because application code will depend on them.
- Implement permission checks in code from `users.role` for the MVP.
- Only split JSON columns into dedicated tables after the workflow needs searching, filtering, or reporting on that data.

## 10. Seed Data Requirements

Initial seed should create:

- One school record.
- Default academic year.
- Default users for Principal, Teacher, Accountant, and Receptionist if demo data is enabled.
- Optional demo classes and subjects for development.
- Common fee plans for development.

Default role behavior:

- Principal: all permissions.
- Teacher: student view, assigned attendance, marks entry, exams view, own leave.
- Accountant: student view, fees, payments, receipts, fee reports.
- Receptionist: admissions, students, parent information, communication support.

## 11. Data Integrity Rules

- A student must belong to one class-section record for the active academic year.
- A student must have one primary parent or guardian phone number.
- A student can have only one attendance record per date.
- A teacher can have only one attendance record per date.
- A teacher assignment cannot be duplicated for the same academic year.
- A payment must generate exactly one receipt number.
- A ledger balance must equal amount due minus amount paid.
- Marks obtained cannot be greater than maximum marks.
- Result summaries should be generated from marks at read/export time.
- Notification recipient details can stay in JSON for MVP, but must keep enough detail to troubleshoot failed sends.
- Audit logs must not be hard deleted through normal application flows.
