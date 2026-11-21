# MedKnot --- Web Service Project Overview

## 1. Project Introduction

**Project name:** MedKnot\
**Project type:** AI Smart Healthcare Triage & Care Management Platform\
**Application scope:** Hospital and clinic web service\
**Current development scope:** Hospital Web Portal for administrators,
doctors, nurses, and reception staff

MedKnot is a web-based healthcare management platform designed to help
hospitals and clinics manage their daily operations through one
centralized system. The web service brings together patient management,
appointment scheduling, queue management, doctor and department
management, medical records, AI-assisted medical document processing,
and administrative workflows.

This document defines the foundation for developing the **MedKnot
Hospital Web Portal**. It focuses on the web service only. It does not
define or require a patient mobile application.

The web portal will use: - **Frontend:** Next.js, React, and
TypeScript - **Backend:** Node.js with Express.js and TypeScript -
**Database:** Supabase PostgreSQL - **Authentication and file storage:**
Supabase services, where required - **AI services:** OCR and an LLM API,
accessed through the backend

The system will be designed so that authorized staff members can access
the correct hospital or clinic workspace according to their role and
permissions.

> **Prototype note:** MedKnot is a final-year project prototype. Use
> mock, synthetic, or properly authorized test data. Do not use real
> patient records with external AI services without the necessary
> privacy, security, and legal approval.

## 2. Project Objectives

The main objectives of MedKnot are:

1.  Simplify patient registration and hospital administration.
2.  Improve appointment scheduling and queue management.
3.  Help doctors access organized patient information and medical
    history.
4.  Use AI to assist with medical document processing and
    pre-consultation preparation.
5.  Improve communication and coordination between hospital staff and
    doctors.
6.  Provide a centralized web service for managing healthcare
    operations.
7.  Reduce repetitive administrative work while keeping healthcare
    professionals responsible for clinical decisions.

## 3. System Architecture

MedKnot is developed as a web service. Authorized hospital users access
the system through a web browser.

### 3.1 Hospital Web Portal

The web portal is designed for: - Hospital administrators - Doctors -
Nursing staff - Receptionists and registration staff

It provides access to: - Patient Management - Appointment Management -
Queue Management - Doctor and Department Management - Medical Records -
AI Medical Assistance - Staff and Facility Administration - Tasks and
Reports

### 3.2 Backend API

The backend is responsible for: - Authentication verification. -
Role-based and facility-level authorization. - Patient and registration
workflows. - Appointment and doctor scheduling workflows. - Queue and
visit status management. - Medical document metadata and secure file
access. - AI/OCR processing requests. - Staff tasks, notifications, and
reports. - Database operations and audit records.

The frontend must communicate with the backend API for application
operations. Important business rules and permission checks must not
exist only in the frontend.

### 3.3 Database and Storage

Supabase will provide: - PostgreSQL database for application data. -
Authentication services, if Supabase Auth is selected. - Private file
storage for medical documents. - Row Level Security (RLS) as an
additional database protection layer.

The Node.js backend will control application workflows and verify access
before returning protected information.

## 4. Technology Stack

### 4.1 Frontend

  Technology        Purpose
  ----------------- -------------------------------------------
  Next.js           Main web application and routing
  React             UI components
  TypeScript        Type safety and maintainability
  Tailwind CSS      Styling and responsive layouts
  shadcn/ui         Reusable interface components
  React Hook Form   Form handling
  Zod               Form and input validation
  TanStack Query    API data fetching, caching, and mutations
  Recharts          Dashboard charts and reports
  Lucide React      Icons

**Frontend responsibilities:** - Build the web portal screens and
navigation. - Display information returned by the backend. - Collect and
validate staff input. - Call backend API endpoints. - Show loading,
success, empty, and error states. - Provide responsive layouts for
desktop and tablet screens. - Display actions and pages according to the
user's role.

Frontend visibility rules improve the user experience but are not
security controls. The backend must authorize every protected operation.

### 4.2 Backend

  Technology                Purpose
  ------------------------- --------------------------------------
  Node.js                   Backend runtime
  Express.js                REST API framework
  TypeScript                Type-safe backend development
  Zod                       Request validation
  Supabase JavaScript SDK   Connect backend services to Supabase
  JWT verification          Verify authenticated user identity
  Pino or equivalent        Application logging

**Backend responsibilities:** - Verify the signed-in user's identity. -
Check roles, permissions, and facility membership. - Apply application
business rules. - Process patient registration requests. - Manage
doctors, departments, and appointments. - Update queue and visit
statuses. - Handle medical document workflows. - Call OCR and AI
services securely. - Communicate with Supabase. - Record important
actions for audit purposes.

Organize backend code into modules and service layers. Avoid placing all
business logic directly inside route handlers.

### 4.3 Database --- Supabase PostgreSQL

  -----------------------------------------------------------------------
  Supabase service                    Purpose
  ----------------------------------- -----------------------------------
  PostgreSQL Database                 Store application data and
                                      relationships

  Supabase Auth                       Staff authentication, if selected

  Supabase Storage                    Store uploaded medical documents in
                                      private buckets

  Row Level Security (RLS)            Add database-level access
                                      protection

  Database migrations                 Track database schema changes
  -----------------------------------------------------------------------

**Recommended approach:** Use Supabase PostgreSQL as the main database.
The Node.js backend should handle application logic and authorization.
If Supabase Auth is used, the backend must verify the user's access
token.

RLS should be configured as an additional security layer. Do not rely
only on frontend checks. Never expose the Supabase service-role key in
browser code or commit it to GitHub.

### 4.4 AI and Document Processing

  -----------------------------------------------------------------------
  Component                           Purpose
  ----------------------------------- -----------------------------------
  OCR service                         Read text from supported scanned
                                      documents

  AI/LLM service                      Prepare draft fields and summaries
                                      from extracted information

  Backend AI module                   Validate and manage AI outputs

  Staff review interface              Allow authorized staff to correct
                                      and review AI drafts
  -----------------------------------------------------------------------

The initial prototype should support a limited number of document types,
such as typed laboratory reports or printed registration forms.

The original document must be preserved. AI-extracted information must
be clearly labelled as a draft until reviewed. AI must not invent
missing values, diagnose patients, prescribe medication, or silently
change verified medical records.

## 5. High-Level System Architecture

``` text
              Staff / Doctor / Admin
                       |
                       v
                Web Browser
                       |
                       v
              Next.js Web Portal
                       |
                 REST API Calls
                       |
                       v
             Node.js + Express API
                       |
          +------------+-------------+
          |            |             |
          v            v             v
     Supabase       Supabase      OCR / AI
       Auth         PostgreSQL    Services
                       |
                       v
                Supabase Storage
              (private documents)
```

All protected operations must pass through backend authentication and
authorization checks. The browser must not connect to unrestricted
medical data or contain privileged service credentials.

## 6. User Roles and Permissions

The web portal supports different user roles with different access
permissions.

### Hospital Administrator

-   Manage hospital or clinic information and settings.
-   Manage staff accounts.
-   Assign roles and permissions.
-   Manage doctors, departments, and schedules.
-   Access administrative reports.
-   Oversee facility operations.

### Doctor

-   View assigned patients.
-   Access authorized medical records.
-   View and manage permitted appointments.
-   Review AI-generated summaries and extracted information.
-   Manage consultation and follow-up workflows.
-   Record clinician-verified information.

### Nursing Staff

-   View assigned patients.
-   Assist with patient registration and intake.
-   Manage permitted check-in and queue workflows.
-   Update permitted patient information.
-   Assist with document workflows according to permissions.

### Receptionist

-   Register patients.
-   Review registration requests.
-   Manage appointment requests.
-   Handle patient check-in.
-   Monitor waiting queues.
-   Perform front-desk administrative tasks.

Access to patient information and clinical functions must follow
role-based permissions and applicable healthcare privacy requirements. A
user should only access information required for their assigned work.

## 7. Hospital Web Portal --- Module Structure

The web portal is divided into eight main modules.

  -------------------------------------------------------------------------------------------
  Module                  Name                    Routes / Pages
  ----------------------- ----------------------- -------------------------------------------
  M1                      Authentication &        `/login`, `/forgot-password`, `/dashboard`
                          Dashboard               

  M2                      Patient Management      `/dashboard/patients`,
                                                  `/dashboard/patients/[patientId]`,
                                                  `/dashboard/registrations`

  M3                      Appointment Management  `/dashboard/appointments`,
                                                  `/dashboard/appointments/[appointmentId]`

  M4                      Queue Management        `/dashboard/queue`

  M5                      Clinical & Facility     `/dashboard/doctors`,
                          Management              `/dashboard/departments`,
                                                  `/dashboard/settings/facility`

  M6                      Medical Records         `/dashboard/documents`,
                                                  `/dashboard/documents/[documentId]`

  M7                      AI Medical Assistance   `/dashboard/ai-review`

  M8                      Operations &            `/dashboard/tasks`, `/dashboard/reports`,
                          Administration          `/dashboard/settings`,
                                                  `/dashboard/settings/staff`
  -------------------------------------------------------------------------------------------

### M1. Authentication & Dashboard

**Purpose:** Provide secure access to the hospital web portal and a
centralized overview for authorized users.

Main features: - Staff and doctor login. - Forgot password and password
recovery. - Role-based access control. - Dashboard overview. - Shared
navigation, sidebar, and dashboard layout.

### M2. Patient Management

**Purpose:** Manage patient information and registration activities.

Main features: - Patient directory. - Patient profile and details. -
Patient registration requests. - Registration review and approval. -
Patient information management. - Patient search and filters.

### M3. Appointment Management

**Purpose:** Manage hospital appointments and coordinate doctors'
schedules.

Main features: - Appointment listing. - Appointment details. -
Appointment status management. - Doctor assignment. - Appointment
scheduling and availability. - Rescheduling and cancellation.

### M4. Queue Management

**Purpose:** Organize patient queues and improve hospital visit
coordination.

Main features: - Queue overview. - Patient waiting list. - Patient
check-in status. - Queue position and status tracking. - Visit status
tracking. - Estimated waiting time where sufficient data is available.

Any clinical priority must follow the facility's approved procedures and
professional judgment. AI must not independently decide clinical
priority.

### M5. Clinical & Facility Management

**Purpose:** Manage doctor information, hospital departments, and
facility details.

Main features: - Doctor directory. - Doctor profiles. - Department
management. - Facility information. - Doctor and department
assignment. - Availability and schedule management.

### M6. Medical Records

**Purpose:** Organize and provide authorized access to patient medical
documents and health information.

Main features: - Medical document directory. - Document details. -
Medical history. - Document upload and management. - Patient health
information. - Access to original documents according to permissions.

### M7. AI Medical Assistance

**Purpose:** Provide AI-assisted tools to support healthcare
professionals.

Main features: - Medical document processing. - OCR and information
extraction. - AI-generated pre-consultation summaries. - AI review
interface. - Doctor or authorized staff review of extracted information
and summaries.

**Important:** AI-generated information supports healthcare
professionals. It must not independently diagnose patients, prescribe
treatments, or replace clinical decisions.

### M8. Operations & Administration

**Purpose:** Support hospital operations and administrative activities.

Main features: - Staff task management. - Follow-up tasks. - Basic
operational reports. - Staff settings. - Facility settings. -
Administrative management.

## 8. Suggested Next.js Route Structure

``` text
/login
/forgot-password

/dashboard
/dashboard/patients
/dashboard/patients/[patientId]
/dashboard/registrations
/dashboard/appointments
/dashboard/appointments/[appointmentId]
/dashboard/queue
/dashboard/doctors
/dashboard/departments
/dashboard/documents
/dashboard/documents/[documentId]
/dashboard/ai-review
/dashboard/tasks
/dashboard/reports
/dashboard/settings
/dashboard/settings/staff
/dashboard/settings/facility
```

Use protected layouts for authenticated users. The backend must still
verify every request and permission.

## 9. Suggested Frontend Folder Structure

``` text
medknot-web/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── patients/
│   │   │       ├── registrations/
│   │   │       ├── appointments/
│   │   │       ├── queue/
│   │   │       ├── doctors/
│   │   │       ├── departments/
│   │   │       ├── documents/
│   │   │       ├── ai-review/
│   │   │       ├── tasks/
│   │   │       ├── reports/
│   │   │       └── settings/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── queue/
│   │   ├── documents/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── registrations/
│   │   ├── appointments/
│   │   ├── queue/
│   │   ├── documents/
│   │   └── analytics/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── validation/
│   │   └── utils/
│   ├── hooks/
│   ├── types/
│   └── config/
├── .env.example
├── package.json
└── README.md
```

## 10. Suggested Backend Folder Structure

``` text
medknot-api/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── validate.ts
│   │   └── error-handler.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── facilities/
│   │   ├── staff/
│   │   ├── patients/
│   │   ├── registrations/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── queue/
│   │   ├── documents/
│   │   ├── ai-processing/
│   │   ├── tasks/
│   │   └── analytics/
│   ├── services/
│   ├── utils/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── README.md
```

## 11. Initial Database Design

The following are suggested database entities for the first version.
Confirm final columns and relationships before implementation.

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `profiles`                          User profile linked to the
                                      authentication user

  `facilities`                        Hospital and clinic details

  `staff_memberships`                 Links staff users to facilities and
                                      roles

  `patients`                          Patient profile

  `facility_patients`                 Facility-specific patient
                                      registration and ID

  `departments`                       Facility departments

  `specialties`                       Medical specialties

  `doctor_profiles`                   Doctor information and facility
                                      association

  `availability_slots`                Doctor or facility availability

  `registration_requests`             Registration submissions and review
                                      status

  `appointments`                      Appointment requests, assignment,
                                      and status

  `queue_entries`                     Patient queue entries

  `queue_events`                      Queue status history

  `encounters`                        Visit and consultation records

  `medical_documents`                 Original document metadata and
                                      storage reference

  `extracted_document_fields`         AI-extracted draft fields

  `document_reviews`                  Staff review and correction records

  `treatment_records`                 Facility-recorded treatment
                                      information

  `medication_records`                Medication information and source

  `staff_tasks`                       Pending administrative tasks

  `notifications`                     Staff notifications

  `consent_records`                   Consent and authorized sharing
                                      records where required

  `audit_events`                      Important access and change events

  `ai_processing_jobs`                OCR and AI processing status and
                                      metadata
  -----------------------------------------------------------------------

Important relationships: - One facility can have multiple staff
memberships, doctors, departments, appointments, and queue entries. -
One patient can have multiple appointments and medical documents. - One
patient may have a separate facility-specific record at each facility. -
One medical document can have multiple extracted fields and review
records. - Important changes should be traceable through audit events.

## 12. Suggested Backend API Endpoints

These are example REST endpoints. Exact request and response formats
should be agreed upon by the frontend and backend developers.

  ---------------------------------------------------------------------------------
  Method                  Endpoint                          Purpose
  ----------------------- --------------------------------- -----------------------
  GET                     `/api/dashboard/summary`          Get dashboard summary
                                                            for the authorized
                                                            facility

  GET                     `/api/patients`                   List patients the user
                                                            is authorized to access

  GET                     `/api/patients/:id`               Get an authorized
                                                            patient profile

  GET                     `/api/registrations`              List registration
                                                            requests

  PATCH                   `/api/registrations/:id/status`   Update registration
                                                            review status

  GET                     `/api/doctors`                    List facility doctors

  POST                    `/api/doctors`                    Create a doctor profile

  GET                     `/api/appointments`               List facility
                                                            appointments

  POST                    `/api/appointments`               Create an appointment

  PATCH                   `/api/appointments/:id`           Update appointment
                                                            details or status

  GET                     `/api/queue`                      Get the current
                                                            facility queue

  PATCH                   `/api/queue/:id/status`           Update queue status

  POST                    `/api/documents`                  Create a document
                                                            upload record

  GET                     `/api/documents/:id`              Get authorized document
                                                            metadata

  POST                    `/api/documents/:id/process`      Start OCR/AI processing

  GET                     `/api/documents/:id/review`       Get extracted draft
                                                            fields for review

  PATCH                   `/api/documents/:id/review`       Save staff corrections
                                                            or review status

  GET                     `/api/tasks`                      List staff tasks

  GET                     `/api/analytics/summary`          Get permitted facility
                                                            metrics
  ---------------------------------------------------------------------------------

Every endpoint that accesses facility data must verify the signed-in
user's facility membership, role, and permission. Never trust a
`facilityId` sent by the browser without checking that the user is
authorized for it.

## 13. Security and Privacy Requirements

-   Authenticate every protected user.
-   Enforce role-based permissions in the backend.
-   Enforce facility-level access on every relevant query.
-   Configure Supabase RLS as an additional protection layer.
-   Never expose service-role credentials in frontend code.
-   Keep secrets in environment variables.
-   Use private storage buckets for medical documents.
-   Generate short-lived signed URLs only after authorization.
-   Validate uploaded file type and size.
-   Preserve original medical documents.
-   Keep audit records for important access and changes.
-   Collect only information required for the prototype.
-   Use mock, synthetic, or properly authorized test data.
-   Separate patient-reported, AI-extracted, staff-reviewed, and
    clinician-verified information.
-   Do not merge patient records based only on similar names or dates of
    birth.

## 14. Environment Variables

Example only. Use your own project values and never commit real secrets.

### Frontend `.env.local`

``` env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Only variables intended to be public should use the `NEXT_PUBLIC_`
prefix. Do not put secret keys in frontend environment variables.

### Backend `.env`

``` env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Add provider credentials only after selecting AI/OCR services.
AI_PROVIDER_API_KEY=your_ai_provider_key
OCR_PROVIDER_API_KEY=your_ocr_provider_key
```

Service-role, AI, and OCR keys must remain on the server. Use elevated
server credentials only for carefully controlled operations that require
them.

## 15. UI/UX Design Guidelines

All modules must follow one consistent design system.

### Brand Identity

-   Product name: MedKnot
-   Product type: AI-assisted Healthcare Management Platform
-   Design direction: Modern, professional, clean, accessible, and
    trustworthy.

### Color Palette

Use the official MedKnot brand palette shown in the brand identity board. Do not use the previous navy, warm cream, powder blue, or soft gold palette.

| Color Name | Hex Code | Suggested Usage |
|---|---|---|
| Fresh Blue | `#015CA9` | Primary brand color, main actions, active navigation, and key highlights |
| Creamy Avocado | `#DFEEA9` | Soft accent backgrounds, selected states, and supportive highlights |
| Light Blue | `#E1F2FD` | Secondary backgrounds, information panels, and subtle UI surfaces |
| Soft White | `#F8FAF6` | Main application background and clean content areas |
| Sage Green | `#A3C8B4` | Secondary accents, supportive status elements, and decorative details |
| Soft Yellow | `#FAE193` | Warm accent highlights and attention-drawing elements used sparingly |

Keep the interface balanced, light, and accessible. Use Fresh Blue for strong visual emphasis, Soft White as the main background, and the lighter colors for supporting surfaces and accents. Check text and control contrast before using any color combination.

### Typography

-   Primary font: Inter.
-   Maintain a consistent typography hierarchy.
-   Use readable font sizes and spacing.
-   Follow accessible contrast guidelines.

### Shared UI Components

Reuse shared components wherever possible: - Navbar - Sidebar -
Dashboard layout - Buttons - Input fields - Cards - Tables - Modals -
Dropdowns - Status badges - Search and filter components

### Design References

Google Stitch designs are the primary visual references for implementing
the Hospital Web Portal.

Developers and AI coding assistants must follow: - Approved Stitch
screens. - MedKnot Design System. - Brand guidelines. - Existing
reusable components.

Do not independently introduce new colors, typography, navigation
patterns, or layouts without approval.

## 16. Development Scope --- Four-Day MVP

The initial implementation focuses on delivering a working web portal
prototype within four days.

### Priority 1 --- Core Functionality

-   Authentication.
-   Dashboard layout.
-   Patient management.
-   Appointment management.
-   Queue management.
-   Role-based access.

### Priority 2 --- Clinical Features

-   Doctor directory.
-   Department management.
-   Medical document management.
-   AI review interface.

### Priority 3 --- Supporting Features

-   Tasks.
-   Basic reports.
-   Staff and facility settings.

### MVP Development Limitations

The four-day implementation focuses on essential workflows and a
demonstration-ready web service.

The following features may use mock data or simplified implementations
where appropriate: - Advanced analytics. - Real-time notifications. -
Advanced OCR processing. - Predictive queue management. - Complex AI
integrations. - External hospital system integrations.

Mock functionality must be clearly distinguished from implemented
backend functionality.

## 17. Team Responsibilities

The Hospital Web Portal development is divided between two team members.

### Ayadee Aphiwatamorn --- Modules 1--4

Responsible for: - M1. Authentication & Dashboard - M2. Patient
Management - M3. Appointment Management - M4. Queue Management

Additional responsibilities: - Initial project foundation. - Shared
dashboard layout. - Navbar and Sidebar. - Shared UI components. - Design
system implementation. - Initial routing structure.

### Shaili --- Modules 5--8

Responsible for: - M5. Clinical & Facility Management - M6. Medical
Records - M7. AI Medical Assistance - M8. Operations & Administration

Additional responsibilities: - Follow existing UI guidelines. - Reuse
shared components. - Implement assigned modules. - Maintain consistency
with the existing design system.

### Shared Responsibilities

Both developers are responsible for: - Testing their modules. -
Reviewing each other's work. - Maintaining consistent UI/UX. -
Integrating modules. - Fixing bugs and resolving conflicts. - Preparing
the final demonstration.

## 18. Development Workflow & GitHub Collaboration

The project uses a shared GitHub repository for version control and
collaboration.

### Repository Branches

-   `main` --- Stable integrated version.
-   `ayadee-dev` --- Ayadee's development branch.
-   `shaili-dev` --- Shaili's development branch.

### Development Rules

1.  Do not develop directly on the `main` branch.
2.  Each developer must work on their assigned branch.
3.  Pull the latest changes before starting new work.
4.  Commit changes regularly.
5.  Push completed work to GitHub.
6.  Use Pull Requests to merge changes into `main`.
7.  Review and test changes before merging.
8.  Do not overwrite or modify another developer's work without
    coordination.

### AI-Assisted Development

Claude and other AI coding assistants may be used to accelerate
implementation.

AI coding assistants must follow: - This Project Overview. - Design
System documentation. - UI Guidelines. - Approved Stitch designs. -
Existing project structure and components.

AI-generated code must be reviewed and tested before it is committed.

## 19. Expected Outcome

At the end of the initial four-day implementation, MedKnot aims to
deliver a demonstration-ready Hospital Web Portal with:

-   Secure staff and doctor access.
-   A consistent dashboard interface.
-   Patient management.
-   Appointment management.
-   Queue management.
-   Doctor and department management.
-   Medical document management.
-   AI-assisted review interface.
-   Basic administrative features.

The final prototype should demonstrate how the eight modules work
together as one connected hospital web service.

## 20. Final Development Direction

MedKnot is a **web-based hospital and clinic management service**. The
Hospital Web Portal is the current development scope and foundation of
this project.

**Confirmed stack:** - Frontend: Next.js + React + TypeScript -
Styling/UI: Tailwind CSS + shadcn/ui - Backend: Node.js + Express.js +
TypeScript - Database: Supabase PostgreSQL - Authentication: Supabase
Auth, if selected - File storage: Supabase Storage with private access -
AI: OCR service + LLM API called through the backend - Version control:
Git + GitHub - API testing: Postman or Bruno - Design: Figma and
approved Google Stitch screens

**Main demonstration workflow:**

Staff signs in → opens the hospital dashboard → reviews a patient
registration → manages an appointment → checks in the patient → updates
queue status → opens or uploads a medical document → OCR and AI prepare
draft information → authorized staff reviews the extracted fields → AI
prepares a source-linked pre-consultation summary for a doctor.

The first goal is to establish a consistent web project structure,
shared design system, working routes, backend API connection, and secure
database foundation. Implement the core staff workflows first, then
integrate advanced AI features.
