# SchoolOS Product Requirements Document

## 1. Document Information

| Field | Value |
| --- | --- |
| Product | SchoolOS |
| Version | 1.0 |
| Type | School Management System |
| Deployment | Single school |
| Target school size | 100 to 1000 students |
| Target roles | Principal, Teacher, Accountant, Receptionist |
| Status | MVP approved |

## 2. Executive Summary

SchoolOS is a school operations platform for digitizing and centralizing the daily administrative, academic, attendance, fee, and communication workflows of a single school.

The MVP replaces physical registers, Excel sheets, WhatsApp group coordination, manual fee tracking, manual attendance tracking, and disconnected academic records with one integrated platform.

## 3. Product Objectives

### 3.1 Primary Objectives

- Manage the complete student lifecycle from admission to archive, graduation, or exit.
- Manage teachers, staff status, and class or subject assignments.
- Digitize student and teacher attendance.
- Track fees, dues, collections, receipts, and defaulters.
- Send school-to-parent and school-to-teacher communication through WhatsApp.
- Manage exams, marks entry, result generation, and academic reports.
- Provide operational visibility to school leadership through dashboards and reports.
- Enforce role-based access control across all major workflows.
- Maintain audit logs for sensitive operational actions.

### 3.2 Success Metrics

- Daily attendance can be marked and saved for a class within 2 minutes.
- Accountants can identify fee defaulters for any class or section without manual reconciliation.
- Principals can view fee collection, attendance, leave, and exam status from the dashboard.
- Receptionists can create complete student records without needing separate spreadsheets.
- Teachers can enter attendance and marks with minimal clicks.
- All sensitive changes are traceable through audit logs.

## 4. Scope

### 4.1 MVP Included

- Authentication
- User management
- Role-based access control
- Dashboard
- Student management
- Teacher management
- Student attendance
- Teacher attendance
- Leave management
- Fee management
- Receipt generation
- WhatsApp communication
- Exams and results
- Reports
- Settings
- Audit logging

### 4.2 Out of Scope for MVP

- Multi-school or franchise management
- Student or parent mobile app
- Online payment gateway integration
- Biometric attendance integration
- Transport management
- Hostel management
- Library management
- Inventory management
- Payroll management
- Advanced timetable generation
- Custom report builder
- SMS and email delivery channels

## 5. User Personas

### 5.1 Principal

The Principal is responsible for overall school operations, fee collection monitoring, attendance monitoring, teacher management, leave approvals, and result approvals.

Primary needs:

- Operational visibility
- Control over users and permissions
- Fee and attendance reports
- Teacher and leave oversight
- Academic performance insights

### 5.2 Teacher

The Teacher is responsible for class attendance, student monitoring, marks entry, and applying for leave.

Primary needs:

- Fast attendance workflows
- Easy marks entry
- Access to assigned classes and subjects
- Minimal administrative friction

### 5.3 Accountant

The Accountant is responsible for fee collection, receipts, due tracking, fee reports, and defaulter follow-up.

Primary needs:

- Payment visibility
- Student ledger access
- Receipt generation
- Collection and defaulter reports

### 5.4 Receptionist

The Receptionist is responsible for admissions, student registration, maintaining parent information, and parent communication support.

Primary needs:

- Easy student onboarding
- Searchable student and parent records
- Clear admission workflows
- Basic communication support

## 6. Role-Based Access Control

### 6.1 RBAC Model

Each user is assigned one or more roles. Each role maps to a set of permissions. Permissions determine access to screens, APIs, records, and actions.

```text
User
  -> Role
    -> Permissions
```

### 6.2 Default Roles

| Role | Access Summary |
| --- | --- |
| Principal | Full access to all modules, reports, settings, users, approvals, and audit logs. |
| Teacher | Students, assigned classes, attendance, exams, marks entry, and own leave requests. |
| Accountant | Students, fees, payments, receipts, fee reports, and defaulter reports. |
| Receptionist | Admissions, students, parent information, and communication support. |

### 6.3 MVP Permissions

- `VIEW_DASHBOARD`
- `MANAGE_STUDENTS`
- `VIEW_STUDENTS`
- `MANAGE_TEACHERS`
- `VIEW_TEACHERS`
- `MARK_STUDENT_ATTENDANCE`
- `MANAGE_TEACHER_ATTENDANCE`
- `MANAGE_LEAVE_REQUESTS`
- `APPLY_LEAVE`
- `MANAGE_FEES`
- `VIEW_FEES`
- `COLLECT_PAYMENTS`
- `GENERATE_RECEIPTS`
- `SEND_NOTIFICATIONS`
- `MANAGE_EXAMS`
- `ENTER_MARKS`
- `MANAGE_RESULTS`
- `VIEW_REPORTS`
- `MANAGE_USERS`
- `MANAGE_ROLES`
- `MANAGE_SETTINGS`
- `VIEW_AUDIT_LOGS`

## 7. System Modules

- Dashboard
- Students
- Teachers
- Attendance
- Leave Management
- Fees
- Communication
- Exams and Results
- Reports
- Settings
- User Management
- Audit Logs

## 8. Dashboard

### 8.1 Objective

Provide school leadership and permitted staff with a single operational view of students, attendance, teachers, fees, exams, leave requests, and communication status.

### 8.2 KPIs

Student KPIs:

- Total students
- New admissions
- Active students

Attendance KPIs:

- Today's student attendance percentage
- Absent students
- Teacher attendance percentage

Fee KPIs:

- Collected this month
- Pending fees
- Fee defaulters

Teacher KPIs:

- Total teachers
- Teachers present
- Pending leave requests

Exam KPIs:

- Upcoming exams
- Results published

Communication KPIs:

- Messages sent
- Messages delivered
- Failed messages

### 8.3 Use Cases

#### UC-DASH-001: View School Dashboard

Actor: Principal

Preconditions:

- User is authenticated.
- User has `VIEW_DASHBOARD` permission.

Main flow:

1. User opens the dashboard.
2. System displays student, attendance, fee, teacher, exam, and communication KPIs.
3. User filters dashboard by academic year where applicable.
4. System refreshes dashboard metrics.

Acceptance criteria:

- Dashboard loads in less than 2 seconds under expected MVP data volume.
- Dashboard shows only data permitted by the user's role.
- KPI cards link to relevant detailed reports or module pages.

## 9. Student Management

### 9.1 Objective

Maintain complete student records across admission, academic enrollment, parent information, fee linkage, attendance, results, and lifecycle status.

### 9.2 Student Profile Fields

Personal details:

- Photo
- Name
- Admission number
- Date of birth
- Gender

Academic details:

- Class
- Section
- Roll number
- Admission date
- Academic year

Parent and guardian details:

- Father name
- Mother name
- Guardian name
- Phone number
- Alternate phone
- Address

Fee information:

- Fee plan
- Outstanding balance
- Last payment date

Status:

- `ACTIVE`
- `INACTIVE`
- `LEFT`
- `GRADUATED`

### 9.3 Features

- Create student
- Edit student
- Archive student
- Search student
- View student profile
- View student history
- View attendance history
- View fee history
- View result history

### 9.4 Use Cases

#### UC-STU-001: Create Student

Actor: Receptionist, Principal

Preconditions:

- User is authenticated.
- User has `MANAGE_STUDENTS` permission.

Main flow:

1. User opens the student creation form.
2. User enters personal, academic, parent, and fee plan details.
3. System validates mandatory fields.
4. User submits the form.
5. System creates the student record with `ACTIVE` status.
6. System records the action in audit logs.

Acceptance criteria:

- Admission number must be unique.
- Student cannot be saved without name, admission number, class, section, guardian or parent phone number, and admission date.
- Created student appears in student search and class lists.

#### UC-STU-002: Edit Student

Actor: Receptionist, Principal

Preconditions:

- Student exists.
- User has `MANAGE_STUDENTS` permission.

Main flow:

1. User opens a student profile.
2. User edits allowed fields.
3. System validates changes.
4. User saves the record.
5. System updates the student profile and stores an audit log.

Acceptance criteria:

- Changes are reflected immediately in profile and related lists.
- Changes to class, section, roll number, phone number, and fee plan are audit logged.

#### UC-STU-003: Archive Student

Actor: Principal, Receptionist

Preconditions:

- Student exists.
- User has `MANAGE_STUDENTS` permission.

Main flow:

1. User opens student profile.
2. User selects archive or status change.
3. User selects reason and new status.
4. System updates status to `INACTIVE`, `LEFT`, or `GRADUATED`.
5. System removes the student from active operational lists while retaining history.

Acceptance criteria:

- Archived students do not appear in default active student lists.
- Attendance, fee, and result history remains available.

#### UC-STU-004: Search Student

Actor: Principal, Teacher, Accountant, Receptionist

Preconditions:

- User has `VIEW_STUDENTS` permission.

Main flow:

1. User searches by name, admission number, phone number, class, section, or roll number.
2. System returns matching students.
3. User opens a student profile.

Acceptance criteria:

- Search results respect role permissions.
- Search supports partial name and admission number matches.

## 10. Teacher Management

### 10.1 Objective

Manage teacher records, employment status, class assignments, section assignments, and subject assignments.

### 10.2 Teacher Profile Fields

- Photo
- Name
- Phone
- Email
- Joining date
- Status

### 10.3 Assignment Fields

- Teacher
- Class
- Section
- Subject

Example assignment:

- Teacher: Rahul Sharma
- Class: 8
- Section: A
- Subject: Mathematics

### 10.4 Features

- Create teacher
- Edit teacher
- Deactivate teacher
- Assign subject
- Assign class
- View assignments

### 10.5 Use Cases

#### UC-TCH-001: Create Teacher

Actor: Principal

Preconditions:

- User has `MANAGE_TEACHERS` permission.

Main flow:

1. User opens the teacher creation form.
2. User enters teacher details.
3. System validates phone and email.
4. User submits the form.
5. System creates teacher record.

Acceptance criteria:

- Teacher phone must be unique.
- Teacher is available for class and subject assignment after creation.

#### UC-TCH-002: Assign Class and Subject

Actor: Principal

Preconditions:

- Teacher exists.
- Class, section, and subject exist.

Main flow:

1. User opens teacher assignments.
2. User selects class, section, and subject.
3. User saves assignment.
4. System links teacher to selected class, section, and subject.

Acceptance criteria:

- Teacher can view and act only on assigned attendance and marks workflows unless granted broader permissions.
- Duplicate assignment for the same teacher, class, section, and subject is not allowed.

## 11. Attendance

### 11.1 Objective

Digitize daily student attendance and teacher attendance tracking.

### 11.2 Student Attendance Statuses

- `PRESENT`
- `ABSENT`
- `LEAVE`
- `LATE`

### 11.3 Teacher Attendance Statuses

- `PRESENT`
- `ABSENT`
- `LEAVE`

### 11.4 Student Attendance Workflow

```text
Teacher login
  -> Select assigned class and section
  -> Mark attendance
  -> Save attendance
```

### 11.5 Features

- Mark student attendance
- Edit attendance where permitted
- View daily attendance
- View monthly attendance
- View student attendance percentage
- View class attendance percentage
- Manage teacher attendance
- View teacher attendance percentage

### 11.6 Use Cases

#### UC-ATT-001: Mark Student Attendance

Actor: Teacher

Preconditions:

- User has `MARK_STUDENT_ATTENDANCE` permission.
- Teacher is assigned to the selected class and section.
- Active students exist in the class and section.

Main flow:

1. Teacher opens attendance module.
2. Teacher selects class, section, and date.
3. System displays active student list.
4. Teacher marks each student as present, absent, leave, or late.
5. Teacher saves attendance.
6. System stores attendance records and audit log.

Acceptance criteria:

- Attendance cannot be saved for an empty class list.
- A student can have only one attendance status per date.
- Saved attendance appears in attendance reports.

#### UC-ATT-002: Manage Teacher Attendance

Actor: Principal

Preconditions:

- User has `MANAGE_TEACHER_ATTENDANCE` permission.

Main flow:

1. Principal opens teacher attendance.
2. System displays active teacher list.
3. Principal marks each teacher as present, absent, or leave.
4. Principal saves attendance.

Acceptance criteria:

- A teacher can have only one attendance status per date.
- Teacher attendance percentage updates on dashboard and reports.

#### UC-ATT-003: View Attendance Reports

Actor: Principal, Teacher

Preconditions:

- User has required attendance or report permission.

Main flow:

1. User opens attendance reports.
2. User filters by date range, class, section, student, or teacher.
3. System displays matching attendance summary and details.

Acceptance criteria:

- Reports include daily, monthly, student percentage, class percentage, and teacher percentage views.
- Teacher access is limited to assigned classes unless granted broader permissions.

## 12. Leave Management

### 12.1 Objective

Digitize teacher leave requests, approvals, and reporting.

### 12.2 Leave Request Fields

- From date
- To date
- Reason
- Status
- Requested by
- Reviewed by
- Review note

### 12.3 Leave Statuses

- `PENDING`
- `APPROVED`
- `REJECTED`

### 12.4 Workflow

```text
Teacher
  -> Apply leave
  -> Principal review
  -> Approve or reject
```

### 12.5 Use Cases

#### UC-LEV-001: Apply for Leave

Actor: Teacher

Preconditions:

- User has `APPLY_LEAVE` permission.

Main flow:

1. Teacher opens leave request form.
2. Teacher enters from date, to date, and reason.
3. Teacher submits request.
4. System creates leave request with `PENDING` status.

Acceptance criteria:

- To date cannot be before from date.
- Pending request is visible to Principal.

#### UC-LEV-002: Approve or Reject Leave

Actor: Principal

Preconditions:

- User has `MANAGE_LEAVE_REQUESTS` permission.
- Leave request exists with `PENDING` status.

Main flow:

1. Principal opens pending leave requests.
2. Principal reviews request details.
3. Principal approves or rejects the request.
4. System updates status and records reviewer details.

Acceptance criteria:

- Approved leave updates teacher leave reporting.
- Rejected leave stores rejection status and optional review note.

## 13. Fee Management

### 13.1 Objective

Track all fee plans, ledgers, dues, payments, receipts, collections, and defaulters.

### 13.2 Fee Categories

- Admission fee
- Monthly fee
- Annual fee
- Exam fee
- Miscellaneous fee

### 13.3 Payment Methods

- Cash
- UPI
- Bank transfer

### 13.4 Student Fee Ledger

Example:

| Period | Status |
| --- | --- |
| January | Paid |
| February | Paid |
| March | Due |
| April | Due |

### 13.5 Receipt Fields

- Receipt number
- Student name
- Class
- Payment date
- Amount
- Payment method
- Collected by

### 13.6 Features

- Configure fee categories
- Configure fee plans
- Assign fee plan to student
- View student ledger
- Collect fee
- Generate receipt
- Track dues
- View fee reports
- View defaulter reports

### 13.7 Use Cases

#### UC-FEE-001: Create Fee Plan

Actor: Principal, Accountant

Preconditions:

- User has `MANAGE_FEES` permission.

Main flow:

1. User opens fee plan setup.
2. User selects fee category, amount, frequency, and applicable class if needed.
3. User saves fee plan.
4. System makes fee plan available for student assignment.

Acceptance criteria:

- Fee plan amount must be greater than zero.
- Fee plan can be assigned to one or more students.

#### UC-FEE-002: Collect Fee Payment

Actor: Accountant, Principal

Preconditions:

- User has `COLLECT_PAYMENTS` permission.
- Student exists.
- Student has an outstanding or payable ledger item.

Main flow:

1. User opens student fee ledger.
2. User selects due items or enters payment amount.
3. User selects payment method.
4. User records payment.
5. System updates ledger balance.
6. System generates receipt.
7. System records payment in audit logs.

Acceptance criteria:

- Payment amount must be greater than zero.
- Payment updates outstanding balance immediately.
- Receipt number is unique.
- Receipt contains all mandatory receipt fields.

#### UC-FEE-003: View Defaulter Report

Actor: Principal, Accountant

Preconditions:

- User has `VIEW_FEES` or `VIEW_REPORTS` permission.

Main flow:

1. User opens defaulter report.
2. User filters by class, section, academic year, or due period.
3. System displays students with outstanding balances.

Acceptance criteria:

- Report shows student, class, section, parent phone number, outstanding amount, and last payment date.
- Report can be used as audience selection for fee reminders.

#### UC-FEE-004: Generate Receipt

Actor: Accountant, Principal

Preconditions:

- Payment exists.
- User has `GENERATE_RECEIPTS` permission.

Main flow:

1. User opens payment details or student ledger.
2. User selects generate receipt.
3. System generates receipt with payment and student details.

Acceptance criteria:

- Receipt includes receipt number, student name, class, payment date, amount, payment method, and collected by.
- Receipt can be viewed after payment collection.

## 14. Communication

### 14.1 Objective

Enable school-to-parent and school-to-teacher communication through WhatsApp for notices, reminders, exam updates, and announcements.

### 14.2 MVP Delivery Channel

- WhatsApp

### 14.3 Audience Selection

- All parents
- Class wise
- Section wise
- Fee defaulters
- Teachers

### 14.4 Message Categories

General notices:

- Holiday
- Events
- Announcements

Fee reminders:

- Pending fee reminder
- Due date reminder

Exam notifications:

- Exam schedule
- Result published

### 14.5 Delivery Statuses

- `QUEUED`
- `SENT`
- `DELIVERED`
- `FAILED`

### 14.6 Use Cases

#### UC-COM-001: Send Notice

Actor: Principal, Receptionist

Preconditions:

- User has `SEND_NOTIFICATIONS` permission.
- WhatsApp configuration is active.

Main flow:

1. User opens communication module.
2. User selects audience.
3. User selects message category.
4. User writes or selects message template.
5. User sends message.
6. System queues message for delivery.
7. System updates delivery status for each recipient.

Acceptance criteria:

- User can send to all parents, class wise, section wise, fee defaulters, or teachers.
- Each message creates notification and notification log records.
- Delivery status is visible as queued, sent, delivered, or failed.

#### UC-COM-002: Send Fee Reminder

Actor: Accountant, Principal

Preconditions:

- User has `SEND_NOTIFICATIONS` permission.
- Defaulter report contains students with dues.

Main flow:

1. User opens defaulter report.
2. User selects students or fee defaulter audience.
3. User selects fee reminder template.
4. User sends message.

Acceptance criteria:

- Reminder is sent only to students with outstanding dues in the selected filter.
- Notification logs link back to the selected audience and message category.

## 15. Exams and Results

### 15.1 Objective

Digitize exam setup, subject setup, marks entry, result generation, and performance reporting.

### 15.2 Exam Types

- Unit test
- Quarterly
- Half-yearly
- Annual

### 15.3 Exam Fields

- Exam name
- Exam type
- Class
- Start date
- End date

### 15.4 Subject Setup

Example subjects:

- Mathematics
- Science
- English
- Hindi

### 15.5 Marks Entry Fields

- Student
- Subject
- Marks obtained
- Maximum marks

### 15.6 Result Outputs

- Student result
- Class result
- Subject result
- Top students
- Pass percentage
- Class rankings
- Subject rankings

### 15.7 Use Cases

#### UC-EXM-001: Create Exam

Actor: Principal

Preconditions:

- User has `MANAGE_EXAMS` permission.
- Classes and subjects are configured.

Main flow:

1. User opens exam creation form.
2. User enters exam name, type, class, start date, and end date.
3. User selects subjects.
4. User saves exam.

Acceptance criteria:

- End date cannot be before start date.
- Exam appears in upcoming exams until end date passes.

#### UC-EXM-002: Enter Marks

Actor: Teacher, Principal

Preconditions:

- User has `ENTER_MARKS` permission.
- Exam and subjects exist.
- Teacher is assigned to selected class, section, and subject, unless user has broader access.

Main flow:

1. User opens marks entry.
2. User selects exam, class, section, and subject.
3. System displays student list.
4. User enters marks obtained and maximum marks.
5. User saves marks.

Acceptance criteria:

- Marks obtained cannot exceed maximum marks.
- Marks can be saved only for active students in the selected class and section.
- Marks entry is audit logged.

#### UC-EXM-003: Generate Results

Actor: Principal

Preconditions:

- User has `MANAGE_RESULTS` permission.
- Required marks are entered.

Main flow:

1. User opens results module.
2. User selects exam, class, and section.
3. User generates results.
4. System calculates totals, percentages, pass status, rankings, and summaries.
5. User publishes results.

Acceptance criteria:

- Published result is available in student result history.
- Dashboard result count updates after publication.
- Result updates are audit logged.

## 16. Reports

### 16.1 Objective

Provide actionable reports for students, admissions, attendance, fees, teachers, leaves, and exams.

### 16.2 Student Reports

- Student list
- Admission report
- Attendance report

### 16.3 Fee Reports

- Collection report
- Defaulter report
- Daily collection
- Monthly collection

### 16.4 Teacher Reports

- Teacher attendance
- Teacher leave report

### 16.5 Exam Reports

- Class performance
- Student performance
- Subject performance

### 16.6 Use Cases

#### UC-REP-001: View Report

Actor: Principal, Accountant, Teacher, Receptionist

Preconditions:

- User has `VIEW_REPORTS` or module-specific report permission.

Main flow:

1. User opens reports module.
2. User selects report type.
3. User applies filters.
4. System displays report results.

Acceptance criteria:

- Report data respects role permissions.
- Reports support relevant filters such as academic year, class, section, date range, student, teacher, and fee status.

## 17. User Management

### 17.1 Objective

Manage system users, roles, permissions, and account status.

### 17.2 User Fields

- Name
- Email
- Phone
- Status
- Roles

### 17.3 Default Roles

- Principal
- Teacher
- Accountant
- Receptionist

### 17.4 User Lifecycle

```text
Create user
  -> Assign role
  -> Assign permissions
  -> Activate user
```

### 17.5 Use Cases

#### UC-USR-001: Create User

Actor: Principal

Preconditions:

- User has `MANAGE_USERS` permission.

Main flow:

1. Principal opens user management.
2. Principal enters name, email, phone, and role.
3. System creates user account.
4. System sets user status.

Acceptance criteria:

- Email or phone used for login must be unique.
- New user cannot access modules outside assigned role permissions.

#### UC-USR-002: Assign Role and Permissions

Actor: Principal

Preconditions:

- User exists.
- Role exists.
- Principal has `MANAGE_ROLES` permission.

Main flow:

1. Principal opens user profile.
2. Principal assigns role.
3. Principal reviews permissions.
4. Principal saves changes.

Acceptance criteria:

- Permission changes take effect on next request or next login.
- Permission changes are audit logged.

## 18. Settings

### 18.1 Objective

Configure school information, academic structure, communication settings, and templates.

### 18.2 School Information

- School name
- Logo
- Address
- Phone
- Email

### 18.3 Academic Configuration

- Academic year
- Classes
- Sections
- Subjects

### 18.4 Communication Settings

- WhatsApp configuration
- Message templates

### 18.5 Use Cases

#### UC-SET-001: Update School Information

Actor: Principal

Preconditions:

- User has `MANAGE_SETTINGS` permission.

Main flow:

1. Principal opens settings.
2. Principal updates school information.
3. System validates required fields.
4. Principal saves settings.

Acceptance criteria:

- Updated school details appear wherever school identity is displayed, including receipts.

#### UC-SET-002: Configure Academic Structure

Actor: Principal

Preconditions:

- User has `MANAGE_SETTINGS` permission.

Main flow:

1. Principal opens academic configuration.
2. Principal creates or updates academic year, classes, sections, and subjects.
3. System saves configuration.

Acceptance criteria:

- Classes, sections, and subjects are available in student, teacher, attendance, and exam workflows.

#### UC-SET-003: Configure WhatsApp Templates

Actor: Principal

Preconditions:

- User has `MANAGE_SETTINGS` permission.

Main flow:

1. Principal opens communication settings.
2. Principal configures WhatsApp provider details and message templates.
3. System validates required configuration.
4. Principal saves settings.

Acceptance criteria:

- Saved templates are available in communication workflows.
- Communication cannot be sent when required WhatsApp configuration is missing.

## 19. Authentication and Security

### 19.1 Authentication Requirements

- Users must authenticate before accessing the system.
- Passwords must be encrypted using a secure password hashing algorithm.
- APIs must be protected using JWT authentication.
- Inactive users must not be able to log in.

### 19.2 Authorization Requirements

- All protected screens and APIs must enforce permission checks.
- Users must not access records or actions outside their role permissions.
- Teachers must be restricted to assigned classes, sections, and subjects unless granted broader permissions.

### 19.3 Audit Logging

Audit logs must track:

- Student updates
- Fee collections
- Attendance changes
- Result updates
- Permission changes
- User status changes
- Settings changes

Audit log fields:

- Actor user
- Action
- Entity type
- Entity ID
- Previous value where applicable
- New value where applicable
- Timestamp

## 20. Database Design

### 20.1 Core Tables

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `students`
- `parents`
- `teachers`
- `classes`
- `sections`
- `subjects`
- `teacher_assignments`
- `student_attendance`
- `teacher_attendance`
- `leave_requests`
- `fee_plans`
- `fee_ledgers`
- `payments`
- `receipts`
- `exams`
- `exam_subjects`
- `marks`
- `notifications`
- `notification_logs`
- `audit_logs`

### 20.2 Key Data Rules

- Admission number must be unique per school.
- Receipt number must be unique.
- A student can have only one attendance record per date.
- A teacher can have only one attendance record per date.
- A payment must be linked to a student and receipt.
- Marks must be linked to an exam, student, and subject.
- Archived students retain all historical records.

## 21. Non-Functional Requirements

### 21.1 Performance

- Page load time must be less than 2 seconds for common screens under MVP scale.
- Search results should return within 2 seconds for up to 1000 students.
- Attendance save should complete within 2 seconds for a class-sized list.

### 21.2 Availability

- Target availability: 99.5%.

### 21.3 Scalability

The MVP must support:

- 1000+ students
- 100+ teachers
- 100,000+ attendance records

### 21.4 Usability

- Common daily workflows must require minimal clicks.
- Teachers must be able to mark attendance quickly from assigned classes.
- Accountants must be able to collect fees and generate receipts from a student ledger.
- Receptionists must be able to create and search student records easily.

### 21.5 Data Integrity

- Mandatory fields must be validated before save.
- Critical operations must be audit logged.
- Duplicate operational records must be prevented where uniqueness is required.

## 22. MVP Acceptance Criteria

The SchoolOS MVP is complete when:

- Principal can log in and access all modules.
- Principal can create users, assign roles, and manage permissions.
- Receptionist can create, edit, archive, and search students.
- Principal can create teachers and assign them to classes, sections, and subjects.
- Teacher can mark student attendance for assigned classes.
- Principal can manage teacher attendance.
- Teacher can apply for leave.
- Principal can approve or reject leave requests.
- Accountant can configure fees, collect payments, generate receipts, and view ledgers.
- Principal and Accountant can view collection and defaulter reports.
- Authorized users can send WhatsApp notices and reminders to selected audiences.
- Principal can create exams, teachers can enter marks, and Principal can generate results.
- Reports are available for students, attendance, fees, teachers, leave, and exams.
- Settings allow configuration of school information, academic years, classes, sections, subjects, WhatsApp details, and message templates.
- Sensitive changes are written to audit logs.
- Role-based permissions are enforced across screens and APIs.

## 23. Future Enhancements

- Multi-school support
- Parent mobile app
- Student mobile app
- Online fee payment gateway
- SMS and email notifications
- Transport management
- Hostel management
- Library management
- Payroll management
- Timetable management
- Biometric attendance integration
- Advanced analytics
- Custom report builder
