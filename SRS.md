# Gym Management System — MVP

**Software Requirements Specification | Version 1.0 | Next.js + Supabase**

## 1. Project Overview
The Gym Management System is a web-based MVP for small and medium-sized gyms. It replaces manual registers/spreadsheets with one system for managing participants, memberships, gender-specific gym schedules, attendance, violations and fines. The core workflow is: Participant → Subscription → Access Schedule → Check-in → Attendance → Violations/Fines → Dashboard.

## 2. MVP Goals & Scope

| Area | MVP Requirement |
|---|---|
| Authentication | Secure login/logout for gym owner and staff. |
| Participants | Create, view, edit, search, filter, activate, deactivate and suspend participants. |
| Subscriptions | Create memberships, track dates, price, payment status, expiry and renewals. |
| Schedules | Configure gym hours by gender and day of week. |
| Attendance | Search participants and record validated check-ins; view history. |
| Violations & Fines | Record violations, assign fines, track unpaid/paid/waived status. |
| Dashboard | Show participants, active memberships, today's attendance, expiring memberships, fines and recent activity. |

## 3. User Roles

| Role | Permissions |
|---|---|
| Owner | Full access; manage participants, subscriptions, schedules, attendance, violations/fines and staff/settings. |
| Staff | Day-to-day participant, subscription, attendance, violation and fine operations; no owner/system administration. |

## 4. Functional Requirements

### 4.1 Participants
- Store name, phone, gender, join date, optional DOB/photo/emergency contact/notes, and status (ACTIVE, INACTIVE, SUSPENDED).
- Provide participant list with search by name/phone and filters by gender/status.
- Participant profile shows current membership, membership history, attendance history, violations and outstanding fines.

### 4.2 Subscriptions
- Create and manage memberships with participant, plan name, start/end dates, price and payment status (PAID, PARTIAL, UNPAID).
- Membership status is ACTIVE, EXPIRED or CANCELLED. Expiry is determined from dates.
- Renewals create a new historical subscription record rather than overwriting previous membership history.

### 4.3 Gender-Specific Schedules
- Owner can configure active schedules by gender, day of week, start time and end time.
- The system uses the participant's gender, current day and current time when validating access.

### 4.4 Attendance & Check-in
- Staff searches/selects a participant and requests check-in.
- Server validates participant status, active subscription, current gender schedule and duplicate active check-in.
- If valid, create an attendance record with date/check-in time; otherwise show a clear reason for denial.
- Example denial reasons: membership expired, participant suspended, gym hours closed, or already checked in.

### 4.5 Violations & Fines
- Record violation type, description, participant, fine amount, creator and date.
- Suggested types: Equipment Misuse, Disruptive Behavior, Unauthorized Entry, Property Damage, Late Payment, Other.
- Fine status: UNPAID, PAID or WAIVED. Marking paid records payment date. Only unpaid fines count toward outstanding totals.

### 4.6 Dashboard
- Display total participants, active memberships, today's attendance and outstanding fines.
- Show memberships expiring soon, today's/recent attendance and recent violations.
- Dashboard figures must reflect current database data.

## 5. Core Business Rules

| ID | Rule |
|---|---|
| BR-01 | A participant may check in only when an active subscription covers the current date. |
| BR-02 | SUSPENDED or INACTIVE participants cannot check in, regardless of membership status. |
| BR-03 | Check-in is allowed only during an active schedule matching the participant's gender and current day/time. |
| BR-04 | A participant cannot have more than one active check-in for the same day. |
| BR-05 | Subscription renewal preserves historical subscription records. |
| BR-06 | Deactivating a participant must not delete historical attendance, subscription or violation data. |
| BR-07 | Only UNPAID fines are included in the outstanding-fine total. |
| BR-08 | Critical eligibility checks must execute server-side; frontend validation alone is not trusted. |

## 6. Recommended Database Model

| Table | Key Fields / Purpose |
|---|---|
| profiles | id, full_name, email, role; authenticated gym users (OWNER/STAFF). |
| participants | id, full_name, phone, gender, join_date, status, optional contact/profile fields. |
| subscriptions | id, participant_id, plan_name, start_date, end_date, price, payment_status, status. |
| gym_schedules | id, gender, day_of_week, start_time, end_time, is_active. |
| attendance | id, participant_id, attendance_date, check_in, check_out, status. |
| violations | id, participant_id, type, description, fine_amount, fine_status, paid_at, created_by, created_at. |

*Relationships:* participants 1→N subscriptions; participants 1→N attendance; participants 1→N violations; profiles 1→N created records.

## 7. Main Screens

| Screen | Main Components |
|---|---|
| Login | Email, password, login, validation/error state. |
| Dashboard | KPI cards, quick check-in, expiring memberships, attendance, violations, outstanding fines. |
| Participants | Search/filter, participant table, add/edit, status controls. |
| Participant Details | Profile information, subscription, attendance, violations and fines. |
| Subscriptions | List/filter, create, renew, payment status, expiry information. |
| Attendance | Participant search, eligibility result, check-in, today's/history view. |
| Violations | List/filter, add violation, fine amount/status, mark fine paid. |
| Settings | Gender/day schedules, basic gym information, owner-only staff management. |

## 8. Technology & Architecture
- **Frontend**: Next.js (App Router) + TypeScript + responsive UI.
- **Backend**: Next.js Server Actions and/or Route Handlers for server-side operations.
- **Database**: Supabase PostgreSQL with relational constraints and indexes.
- **Authentication**: Supabase Auth.
- **Authorization**: Role checks plus Supabase Row Level Security (RLS).
- **Storage**: Supabase Storage only if participant profile photos are implemented.
- **Validation**: Client-side UX validation plus server-side validation for all critical operations.

## 9. Non-Functional Requirements
- **Security**: authenticated protected routes, RLS, server-side authorization, no service-role key in the browser.
- **Performance**: normal CRUD/dashboard operations should generally respond within ~2 seconds under expected MVP load.
- **Responsive**: usable on desktop, laptop, tablet and mobile browser.
- **Usability**: common tasks such as participant search and check-in should require minimal steps.
- **Data integrity**: historical attendance, memberships and violations must remain consistent and must not be accidentally deleted.

## 10. Out of Scope for MVP
Online payment gateways, mobile apps, QR/biometric/face recognition, trainer management, workout and diet plans, inventory, payroll, multi-branch management, WhatsApp/SMS/email automation, advanced accounting, customer self-service portal and AI features.

## 11. MVP Acceptance Criteria
- Owner/staff can log in and access authorized gym data.
- A participant can be created, edited, searched and viewed with history.
- A membership can be created and renewed while preserving history.
- Owner can configure gender/day/time schedules.
- A valid participant can successfully check in and attendance is recorded.
- An ineligible participant is denied check-in with a meaningful reason.
- Staff can record a violation and associated fine, then mark the fine paid.
- Dashboard statistics update from real database records.
- RLS and role permissions prevent unauthorized cross-gym or owner-only access.

## 12. End-to-End MVP Workflow
`LOGIN → ADD PARTICIPANT → CREATE MEMBERSHIP → CONFIGURE SCHEDULE → CHECK-IN → ATTENDANCE → VIOLATION/FINE → DASHBOARD`