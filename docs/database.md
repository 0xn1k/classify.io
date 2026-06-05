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

- Use PostgreSQL as the source of truth for all SchoolOS business data.
- Use Supabase Auth for login identity and store the linked application profile in `users`.
- Use UUID primary keys for core entities.
- Use foreign keys for all domain relationships.
- Use enum values for controlled statuses and types.
- Use `Decimal` for fee and payment amounts.
- Keep historical records instead of hard deleting operational data.
- Use `created_at` and `updated_at` on all mutable tables.
- Use `created_by` and `updated_by` where auditability is useful.
- Use audit logs for sensitive changes.
- Design the MVP for one school, but include `school_id` in most business tables to make future multi-school support easier.

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
NotificationStatus: QUEUED, SENT, DELIVERED, FAILED
ExamType: UNIT_TEST, QUARTERLY, HALF_YEARLY, ANNUAL
ExamStatus: DRAFT, SCHEDULED, COMPLETED, RESULT_PUBLISHED
ResultStatus: GENERATED, PUBLISHED
AuditAction: CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, REJECT, LOGIN, LOGOUT, PAYMENT_COLLECTED, RESULT_GENERATED, RESULT_PUBLISHED, PERMISSION_CHANGED
```

## 5. Tables

## 5.1 `schools`

Purpose: Stores school identity and contact information. MVP has one school, but this table keeps the architecture ready for future multi-school support.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `name` | Text | Yes | School name. |
| `logo_url` | Text | No | School logo URL. |
| `address` | Text | No | School address. |
| `phone` | Text | No | School phone number. |
| `email` | Text | No | School email. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Primary key on `id`.

## 5.2 `users`

Purpose: Stores application users linked to Supabase Auth identities.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `supabase_user_id` | UUID | Yes | Supabase Auth user ID. |
| `name` | Text | Yes | User display name. |
| `email` | Text | Yes | User email. |
| `phone` | Text | No | User phone number. |
| `status` | UserStatus | Yes | User account status. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `supabase_user_id`.
- Unique index on `email`.
- Index on `school_id`.
- Index on `status`.

## 5.3 `roles`

Purpose: Defines application roles such as Principal, Teacher, Accountant, and Receptionist.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID nullable | No | Null for system default roles, set for school-specific roles. |
| `name` | Text | Yes | Role name. |
| `description` | Text | No | Role description. |
| `is_system` | Boolean | Yes | Whether role is a default system role. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.

## 5.4 `permissions`

Purpose: Stores permission keys used for API and UI authorization.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `key` | Text | Yes | Permission key, for example `MANAGE_STUDENTS`. |
| `description` | Text | No | Human-readable description. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Unique index on `key`.

## 5.5 `role_permissions`

Purpose: Join table between roles and permissions.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `role_id` | UUID | Yes | References `roles.id`. |
| `permission_id` | UUID | Yes | References `permissions.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Composite primary key on `role_id` and `permission_id`.

## 5.6 `user_roles`

Purpose: Join table between users and roles.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | UUID | Yes | References `users.id`. |
| `role_id` | UUID | Yes | References `roles.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Composite primary key on `user_id` and `role_id`.

## 5.7 `academic_years`

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

## 5.8 `classes`

Purpose: Stores school classes such as Class 1, Class 8, or Class 10.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `name` | Text | Yes | Class name. |
| `sort_order` | Integer | No | Display order. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.

## 5.9 `sections`

Purpose: Stores class sections such as A, B, or C.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `name` | Text | Yes | Section name. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `class_id` and `name`.
- Index on `school_id`.

## 5.10 `subjects`

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

## 5.11 `parents`

Purpose: Stores parent or guardian contact records linked to students.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `father_name` | Text | No | Father's name. |
| `mother_name` | Text | No | Mother's name. |
| `guardian_name` | Text | No | Guardian name. |
| `phone` | Text | Yes | Primary contact phone. |
| `alternate_phone` | Text | No | Alternate phone. |
| `address` | Text | No | Parent or guardian address. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `school_id`.
- Index on `phone`.

## 5.12 `students`

Purpose: Stores student profiles, academic placement, lifecycle status, and parent link.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `parent_id` | UUID | Yes | References `parents.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `section_id` | UUID | Yes | References `sections.id`. |
| `fee_plan_id` | UUID nullable | No | References `fee_plans.id`. |
| `photo_url` | Text | No | Student photo URL. |
| `name` | Text | Yes | Student full name. |
| `admission_number` | Text | Yes | Unique admission number. |
| `date_of_birth` | Date | No | Student date of birth. |
| `gender` | Text | No | Student gender. |
| `roll_number` | Text | No | Class roll number. |
| `admission_date` | Date | Yes | Admission date. |
| `status` | StudentStatus | Yes | Student lifecycle status. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |
| `created_by` | UUID nullable | No | References `users.id`. |
| `updated_by` | UUID nullable | No | References `users.id`. |

Indexes and constraints:

- Unique index on `school_id` and `admission_number`.
- Unique index on `academic_year_id`, `class_id`, `section_id`, and `roll_number` where roll number exists.
- Index on `school_id`, `status`.
- Index on `class_id`, `section_id`.
- Index on `parent_id`.

## 5.13 `teachers`

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

## 5.14 `teacher_assignments`

Purpose: Links teachers to classes, sections, and subjects.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `teacher_id` | UUID | Yes | References `teachers.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `section_id` | UUID | Yes | References `sections.id`. |
| `subject_id` | UUID | Yes | References `subjects.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `teacher_id`, `class_id`, `section_id`, `subject_id`, and `academic_year_id`.
- Index on `class_id`, `section_id`.
- Index on `subject_id`.

## 5.15 `student_attendance`

Purpose: Stores daily attendance status for students.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `class_id` | UUID | Yes | References `classes.id`. |
| `section_id` | UUID | Yes | References `sections.id`. |
| `academic_year_id` | UUID | Yes | References `academic_years.id`. |
| `date` | Date | Yes | Attendance date. |
| `status` | AttendanceStatus | Yes | Attendance status. |
| `marked_by` | UUID | Yes | References `users.id`. |
| `notes` | Text | No | Optional notes. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `student_id` and `date`.
- Index on `class_id`, `section_id`, and `date`.
- Index on `academic_year_id`.

## 5.16 `teacher_attendance`

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

- Unique index on `teacher_id` and `date`.
- Index on `school_id` and `date`.

## 5.17 `leave_requests`

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

## 5.18 `fee_categories`

Purpose: Stores fee category labels such as Admission Fee, Monthly Fee, Annual Fee, Exam Fee, and Miscellaneous Fee.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `name` | Text | Yes | Fee category name. |
| `description` | Text | No | Optional description. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.

## 5.19 `fee_plans`

Purpose: Stores configured fee plans that can be assigned to students.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `category_id` | UUID | Yes | References `fee_categories.id`. |
| `name` | Text | Yes | Fee plan name. |
| `amount` | Decimal | Yes | Fee amount. |
| `frequency` | FeeFrequency | Yes | Fee frequency. |
| `class_id` | UUID nullable | No | Optional class-specific plan. |
| `is_active` | Boolean | Yes | Whether the plan is active. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.
- Index on `category_id`.
- Index on `class_id`.

## 5.20 `fee_ledgers`

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
- Index on `school_id`, `status`.
- Index on `due_date`.

## 5.21 `payments`

Purpose: Stores fee payments collected from students.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `amount` | Decimal | Yes | Payment amount. |
| `payment_method` | PaymentMethod | Yes | Payment method. |
| `payment_date` | Date | Yes | Payment date. |
| `reference_number` | Text | No | UPI or bank reference number. |
| `collected_by` | UUID | Yes | References `users.id`. |
| `notes` | Text | No | Optional payment notes. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `student_id`.
- Index on `payment_date`.
- Index on `collected_by`.
- Payment amount must be greater than zero.

## 5.22 `payment_allocations`

Purpose: Links a payment to one or more fee ledger items. This supports partial payments and payments covering multiple dues.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `payment_id` | UUID | Yes | References `payments.id`. |
| `fee_ledger_id` | UUID | Yes | References `fee_ledgers.id`. |
| `amount` | Decimal | Yes | Amount allocated to this ledger item. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Unique index on `payment_id` and `fee_ledger_id`.
- Index on `fee_ledger_id`.

## 5.23 `receipts`

Purpose: Stores receipt records generated for payments.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `payment_id` | UUID | Yes | References `payments.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `receipt_number` | Text | Yes | Unique receipt number. |
| `receipt_date` | Date | Yes | Receipt date. |
| `amount` | Decimal | Yes | Receipt amount. |
| `generated_by` | UUID | Yes | References `users.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `receipt_number`.
- Unique index on `payment_id`.
- Index on `student_id`.

## 5.24 `exams`

Purpose: Stores exam definitions and lifecycle state.

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
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `academic_year_id`, `class_id`, and `name`.
- Index on `school_id` and `status`.
- Check that `end_date >= start_date`.

## 5.25 `exam_subjects`

Purpose: Links exams with subjects and maximum marks.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `exam_id` | UUID | Yes | References `exams.id`. |
| `subject_id` | UUID | Yes | References `subjects.id`. |
| `maximum_marks` | Decimal | Yes | Maximum marks for subject. |
| `pass_marks` | Decimal | No | Optional pass marks. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `exam_id` and `subject_id`.

## 5.26 `marks`

Purpose: Stores student marks for exam subjects.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `exam_id` | UUID | Yes | References `exams.id`. |
| `exam_subject_id` | UUID | Yes | References `exam_subjects.id`. |
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
- Index on `exam_subject_id`.
- Marks obtained must not exceed maximum marks.

## 5.27 `results`

Purpose: Stores generated and published student result summaries.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `exam_id` | UUID | Yes | References `exams.id`. |
| `student_id` | UUID | Yes | References `students.id`. |
| `total_marks` | Decimal | Yes | Total marks obtained. |
| `maximum_marks` | Decimal | Yes | Maximum possible marks. |
| `percentage` | Decimal | Yes | Result percentage. |
| `rank` | Integer | No | Class or section rank. |
| `status` | ResultStatus | Yes | Result status. |
| `generated_by` | UUID | Yes | References `users.id`. |
| `published_at` | Timestamp | No | Publication timestamp. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `exam_id` and `student_id`.
- Index on `student_id`.
- Index on `school_id` and `status`.

## 5.28 `notifications`

Purpose: Stores message campaigns or notification requests.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `category` | NotificationCategory | Yes | Message category. |
| `audience_type` | NotificationAudienceType | Yes | Audience selection type. |
| `title` | Text | No | Internal title. |
| `message` | Text | Yes | Message body. |
| `metadata` | Json | No | Filter details or provider metadata. |
| `created_by` | UUID | Yes | References `users.id`. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `school_id` and `category`.
- Index on `created_by`.

## 5.29 `notification_logs`

Purpose: Stores recipient-level delivery records for notifications.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `notification_id` | UUID | Yes | References `notifications.id`. |
| `recipient_type` | Text | Yes | Recipient type, for example parent or teacher. |
| `recipient_id` | UUID nullable | No | Related student, parent, or teacher ID where applicable. |
| `recipient_phone` | Text | Yes | Destination phone number. |
| `status` | NotificationStatus | Yes | Delivery status. |
| `provider_message_id` | Text | No | Provider message ID. |
| `error_message` | Text | No | Provider or delivery error. |
| `sent_at` | Timestamp | No | Sent timestamp. |
| `delivered_at` | Timestamp | No | Delivered timestamp. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Index on `notification_id`.
- Index on `status`.
- Index on `recipient_phone`.

## 5.30 `message_templates`

Purpose: Stores reusable WhatsApp message templates.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `category` | NotificationCategory | Yes | Template category. |
| `name` | Text | Yes | Template name. |
| `body` | Text | Yes | Template body. |
| `is_active` | Boolean | Yes | Whether template is active. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id` and `name`.
- Index on `category`.

## 5.31 `communication_settings`

Purpose: Stores WhatsApp provider configuration for the school.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | UUID | Yes | Primary key. |
| `school_id` | UUID | Yes | References `schools.id`. |
| `provider` | Text | Yes | WhatsApp provider name. |
| `sender_id` | Text | No | Provider sender ID. |
| `config` | Json | No | Non-secret provider configuration. |
| `is_active` | Boolean | Yes | Whether communication is active. |
| `created_at` | Timestamp | Yes | Created timestamp. |
| `updated_at` | Timestamp | Yes | Updated timestamp. |

Indexes and constraints:

- Unique index on `school_id`.

Security note:

- Do not store raw API secrets in this table unless encrypted. Prefer environment variables or a managed secret store.

## 5.32 `audit_logs`

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

## 6. Transaction Requirements

Use database transactions for:

- Student creation with parent creation.
- Payment collection, payment allocations, ledger updates, and receipt generation.
- Attendance bulk save.
- Result generation.
- User role updates.
- Leave approval when teacher attendance or leave reporting needs synchronization.

## 7. Search and Reporting Indexes

Recommended indexes:

- `students.name`
- `students.admission_number`
- `parents.phone`
- `teachers.name`
- `teachers.phone`
- `student_attendance.date`
- `teacher_attendance.date`
- `fee_ledgers.status`
- `fee_ledgers.due_date`
- `payments.payment_date`
- `exams.status`
- `notification_logs.status`

For better search later, PostgreSQL trigram indexes can be added for student and teacher names.

## 8. Prisma Implementation Notes

- Use Prisma `@@map` and `@map` if database table names use snake_case.
- Use Prisma `Decimal` for money and marks.
- Use explicit relation names when a table references `users` more than once.
- Add compound unique constraints for attendance, marks, assignments, and receipts.
- Keep enum names stable because application code will depend on them.
- Seed default roles and permissions during initial setup.

## 9. Seed Data Requirements

Initial seed should create:

- One school record.
- Default permissions.
- Default roles.
- Role-permission mappings.
- Default academic year.
- Common fee categories.
- Optional demo classes, sections, and subjects for development.

Default role behavior:

- Principal: all permissions.
- Teacher: student view, assigned attendance, marks entry, exams view, own leave.
- Accountant: student view, fees, payments, receipts, fee reports.
- Receptionist: admissions, students, parent information, communication support.

## 10. Data Integrity Rules

- A student must belong to one class and section for the active academic year.
- A student must have one parent or guardian contact record.
- A student can have only one attendance record per date.
- A teacher can have only one attendance record per date.
- A teacher assignment cannot be duplicated for the same academic year.
- A fee payment must generate exactly one receipt.
- A payment can be allocated to one or more ledger items.
- A ledger balance must equal amount due minus amount paid.
- Marks obtained cannot be greater than maximum marks.
- A result can be generated only after marks exist for the required subjects.
- Notification logs must remain even when delivery fails.
- Audit logs must not be hard deleted through normal application flows.
