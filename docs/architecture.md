# MedKnot --- System Architecture

**Document:** `architecture.md`\
**Product:** MedKnot --- AI Smart Healthcare Triage & Care Management
Platform\
**Scope:** Patient Mobile Application, Hospital Web Portal, shared
backend, and data services\
**Status:** Proposed implementation architecture based on the technology
stack supplied by the mobile-development team\
**Related documents:** `project-overview.md`, `design-system.md`,
`ui-guidelines.md`, and `MedKnot_Implementation_Workflow.md`

------------------------------------------------------------------------

## 1. Purpose

This document defines the proposed technical architecture for MedKnot.
It describes how the Patient Mobile Application and Hospital Web Portal
communicate with a shared backend, how data is stored, and how
authentication, authorization, documents, and AI-assisted workflows are
handled.

MedKnot has two main user-facing applications:

1.  **Patient Mobile Application** --- allows patients to discover
    participating facilities, register, request appointments, track
    appointment and queue status, and access authorized health
    information.
2.  **Hospital Web Portal** --- allows authorized hospital
    administrators, doctors, nursing staff, and receptionists to manage
    facility workflows.

Both applications must use the same backend business rules and shared
data services. The mobile app and web portal must not create separate
versions of appointment, registration, queue, or permission logic.

## 2. Confirmed Technology Stack

The following stack is based on the technology list supplied by the
mobile-development team.

  -----------------------------------------------------------------------
  Component               Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Patient Mobile Frontend React Native            Patient-facing
                                                  Android/iOS application

  Backend                 Java 21 + Spring Boot   Shared REST API and
                                                  business logic

  IDE                     IntelliJ IDEA Community Java backend
                                                  development

  Database                Microsoft SQL Server    Persistent relational
                                                  data

  Database Connectivity   Spring Data JPA +       Object-relational
                          Hibernate               mapping and database
                                                  access

  Authentication          Spring Security + JWT   Authentication and
                                                  request authorization

  API Testing             Postman                 API request and
                                                  response testing

  Build Tool              Maven                   Backend dependency and
                                                  build management
  -----------------------------------------------------------------------

### 2.1 Hospital Web Portal

The Hospital Web Portal is a separate frontend that consumes the same
Spring Boot backend.

The supplied repository screenshot shows `frontend/hospital-portal/`
containing `next.config.ts`, which suggests that the current portal uses
Next.js. Confirm this by checking its `package.json` before making
framework changes.

  -----------------------------------------------------------------------
  Component                           Technology / status
  ----------------------------------- -----------------------------------
  Hospital Web Portal                 Existing frontend project;
                                      repository screenshot suggests
                                      Next.js

  UI language                         TypeScript/JavaScript according to
                                      the existing project configuration

  Styling and UI                      Follow `design-system.md` and
                                      `ui-guidelines.md`

  Backend communication               REST API provided by Spring Boot
  -----------------------------------------------------------------------

Do not replace the existing portal framework just to make it match the
mobile application. React Native is for the patient mobile app; the
hospital portal remains a separate web application.

### 2.2 Important architecture assumption

This document treats **Java 21 + Spring Boot + Microsoft SQL Server as
the shared backend and database stack for both applications**, not as a
backend used only by the mobile app.

This is the recommended arrangement because both the patient app and
hospital portal need to access the same patient, facility, appointment,
queue, and document workflows.

If the mobile team intends to build a separate backend exclusively for
the mobile app, the team must discuss this before implementation. Two
independent backends would create duplicated business logic and
synchronization complexity.

## 3. Architecture Principles

1.  **One shared backend:** Both applications use the same Spring Boot
    API.
2.  **One source of truth:** Shared records are stored and managed
    through the backend and SQL Server.
3.  **Server-side authorization:** Every protected request is checked by
    Spring Security and application-level permission rules.
4.  **Facility-level data separation:** Users can access only records
    permitted for their role and facility.
5.  **API-first collaboration:** Agree on endpoint paths, request
    fields, response fields, and status values before parallel frontend
    implementation.
6.  **Reusable frontend components:** The web portal uses shared
    Sidebar, Navbar, layout, and UI components.
7.  **Human oversight for AI:** AI prepares draft or extracted
    information for review; it does not diagnose or independently make
    clinical decisions.
8.  **Prototype honesty:** Mock data and simulated workflows must be
    clearly identified.
9.  **Incremental delivery:** Complete the core patient-to-facility
    workflow before adding advanced AI features.

## 4. High-Level System Architecture

``` mermaid
flowchart TB
    PATIENT[Patient Mobile App<br/>React Native]
    PORTAL[Hospital Web Portal<br/>Existing Next.js-style project]
    API[Shared REST API<br/>Java 21 + Spring Boot]
    SECURITY[Spring Security<br/>JWT Authentication and Authorization]
    SERVICES[Backend Business Services]
    DB[(Microsoft SQL Server<br/>Spring Data JPA + Hibernate)]
    FILES[Private Document Storage]
    AI[AI / OCR Processing Services]

    PATIENT --> API
    PORTAL --> API

    API --> SECURITY
    SECURITY --> SERVICES
    SERVICES --> DB
    SERVICES --> FILES
    SERVICES --> AI
```

### 4.1 Request flow

1.  A patient or staff member uses the appropriate application.
2.  The application sends an HTTPS request to the Spring Boot REST API.
3.  Spring Security validates the JWT for protected endpoints.
4.  Backend services check the user's role, facility membership,
    permissions, and access to the requested record.
5.  Spring Data JPA and Hibernate handle database operations against
    Microsoft SQL Server.
6.  The backend returns only the information the requesting user is
    authorized to access.
7.  If a document or AI operation is required, the backend coordinates
    the relevant service after authorization.

The frontend must never be treated as the security boundary.

## 5. Application Layer

### 5.1 Patient Mobile Application

**Technology:** React Native\
**Purpose:** Patient-facing healthcare workflows.

Planned capabilities: - Patient registration and sign-in. - Patient
profile. - Facility discovery. - Facility-specific registration. -
Appointment requests and appointment status. - Queue and visit status. -
Medical document upload and access. - Patient health timeline. - Guided
intake and report explanation where included in scope.

The mobile application communicates with the shared Spring Boot API over
HTTPS. It must not connect directly to Microsoft SQL Server.

### 5.2 Hospital Web Portal

**Purpose:** Role-aware workspace for hospital and clinic staff.

The agreed MVP route groups are:

  -------------------------------------------------------------------------------
  Module                              Routes
  ----------------------------------- -------------------------------------------
  M1. Authentication & Dashboard      `/login`, `/forgot-password`, `/dashboard`

  M2. Patient Management              `/dashboard/patients`,
                                      `/dashboard/patients/[patientId]`,
                                      `/dashboard/registrations`

  M3. Appointment Management          `/dashboard/appointments`,
                                      `/dashboard/appointments/[appointmentId]`

  M4. Queue Management                `/dashboard/queue`

  M5. Clinical & Facility Management  `/dashboard/doctors`,
                                      `/dashboard/departments`,
                                      `/dashboard/settings/facility`

  M6. Medical Records                 `/dashboard/documents`,
                                      `/dashboard/documents/[documentId]`

  M7. AI Medical Assistance           `/dashboard/ai-review`

  M8. Operations & Administration     `/dashboard/tasks`, `/dashboard/reports`,
                                      `/dashboard/settings`,
                                      `/dashboard/settings/staff`
  -------------------------------------------------------------------------------

The web portal communicates with the same Spring Boot API as the patient
mobile application.

### 5.3 Shared frontend components

The Hospital Web Portal should use one shared authenticated layout:

-   `DashboardLayout` --- authenticated page shell.
-   `Sidebar` --- role-aware primary navigation.
-   `Navbar` --- facility context, notifications, and user menu.
-   Shared UI components --- buttons, inputs, cards, tables, badges,
    modals, and form controls.
-   Feature components --- patient, appointment, queue, document, and
    staff-specific interfaces.

Build shared components once and reuse them across modules. Do not
create a separate Sidebar or Navbar for each module.

## 6. Backend Architecture --- Java 21 and Spring Boot

### 6.1 Responsibilities

The Spring Boot backend is the central business and security layer for
both applications.

It is responsible for: - Authentication and JWT validation through
Spring Security. - Role-based access control. - Facility membership and
facility-level authorization. - Patient and facility registration
workflows. - Doctor, department, and appointment management. - Queue and
visit status updates. - Medical document metadata and authorized file
access. - AI processing orchestration. - Staff tasks and
notifications. - Audit events for important actions. - Input validation
and consistent API error responses.

### 6.2 Backend technology

-   **Language:** Java 21.
-   **Framework:** Spring Boot.
-   **Security:** Spring Security.
-   **Authentication token:** JSON Web Token (JWT).
-   **Database access:** Spring Data JPA.
-   **ORM:** Hibernate.
-   **Database:** Microsoft SQL Server.
-   **Build tool:** Maven.
-   **IDE:** IntelliJ IDEA Community.
-   **API testing:** Postman.

### 6.3 Suggested Spring Boot package organization

Adapt this structure to the backend project created by the
mobile/backend developer. Do not create a second backend project if one
already exists.

``` text
backend/
└── src/
    └── main/
        ├── java/
        │   └── com/medknot/
        │       ├── config/
        │       ├── security/
        │       │   ├── JwtAuthenticationFilter.java
        │       │   ├── JwtService.java
        │       │   └── SecurityConfig.java
        │       ├── controller/
        │       ├── dto/
        │       ├── entity/
        │       ├── repository/
        │       ├── service/
        │       ├── exception/
        │       └── MedKnotApplication.java
        └── resources/
            └── application.properties
```

A feature-based package structure is also suitable as the backend grows,
for example `patient`, `facility`, `appointment`, and `document`. The
backend team should choose one consistent organization.

### 6.4 Typical request processing

``` text
Frontend Request
      |
      v
Spring Security Filter Chain
      |
      v
JWT Validation
      |
      v
Controller
      |
      v
Service Layer
      |
      v
Repository (Spring Data JPA)
      |
      v
Hibernate
      |
      v
Microsoft SQL Server
```

Responsibilities: - **Security filter chain:** Validates authentication
for protected requests. - **Controller:** Receives HTTP requests and
returns HTTP responses. - **DTO:** Defines safe request and response
data structures. - **Service:** Applies business rules and authorization
checks. - **Repository:** Performs database operations. - **Entity:**
Represents persisted domain data. - **Exception handling:** Returns
consistent error responses.

Do not expose JPA entities directly as public API responses. Use DTOs to
control which fields are returned.

## 7. Database Architecture --- Microsoft SQL Server

### 7.1 Database responsibilities

Microsoft SQL Server stores the platform's structured relational data,
such as: - User accounts and profiles. - Facilities and departments. -
Staff memberships and roles. - Patient-to-facility registration links. -
Registration requests. - Doctor profiles and specialties. - Availability
and appointments. - Queue entries and visit events. - Medical document
metadata. - AI processing results and review status. - Staff tasks and
audit events.

### 7.2 Database connectivity

Spring Data JPA provides repository abstractions, while Hibernate
handles ORM operations between Java entities and SQL Server tables.

The backend should: - Use JPA entities for persisted data. - Use
repositories for data access. - Use service classes for business
logic. - Use DTOs for API request and response models. - Validate data
before persistence. - Handle transactions for multi-step operations. -
Use database migrations or a controlled schema-management approach. -
Avoid manually duplicating database business rules in frontend code.

### 7.3 Conceptual data domains

The following table describes logical domains, not a finalized SQL
Server schema.

  ----------------------------------------------------------------------------
  Domain                  Conceptual entities          Purpose
  ----------------------- ---------------------------- -----------------------
  Identity                `User`, `Patient`,           User identity and
                          `StaffMembership`, `Role`    access

  Facility                `Facility`, `Department`,    Facility structure
                          `Service`                    

  Registration            `RegistrationRequest`,       Facility-specific
                          `FacilityPatient`            patient registration

  Clinical staff          `DoctorProfile`,             Doctor and scheduling
                          `Specialty`,                 information
                          `AvailabilitySlot`           

  Appointment             `Appointment`                Appointment requests
                                                       and status

  Queue and visit         `QueueEntry`, `QueueEvent`,  Check-in and visit
                          `Encounter`                  progress

  Documents               `MedicalDocument`,           File metadata and
                          `DocumentProcessingResult`   extracted information

  AI assistance           `AISummary`, `AIReview`      Draft AI output and
                                                       human review

  Operations              `Task`, `Notification`,      Staff workflows and
                          `AuditEvent`                 traceability
  ----------------------------------------------------------------------------

The backend team must define the final table names, fields, keys,
constraints, and relationships. Do not assume a table exists simply
because it appears in this conceptual architecture.

### 7.4 Patient and facility record separation

A patient may have one MedKnot platform account and separate
facility-specific patient records.

Important rules: - A platform-level patient account does not
automatically grant every facility access to all patient records. - Each
facility has its own registration and record-access process. - Link a
patient to a facility-specific record only after the required identity
verification and facility workflow. - Do not merge records solely
because names or dates of birth appear similar. - Cross-facility sharing
must follow an appropriate authorized and consent-aware process.

## 8. Authentication and Authorization --- Spring Security + JWT

Authentication answers **who the user is**. Authorization answers **what
the user is allowed to do**.

### 8.1 Authentication flow

``` mermaid
sequenceDiagram
    participant U as User
    participant A as Mobile App / Web Portal
    participant API as Spring Boot API
    participant S as Spring Security
    participant DB as SQL Server

    U->>A: Enter login credentials
    A->>API: Send login request
    API->>DB: Verify account details
    DB-->>API: Account information
    API-->>A: JWT access token (and refresh mechanism if implemented)
    A->>API: Request with Bearer token
    API->>S: Validate JWT
    S-->>API: Authenticated principal
    API->>DB: Check role, facility, and record permissions
    DB-->>API: Authorized data
    API-->>A: Protected response
```

The exact token lifetime, refresh-token mechanism, logout/revocation
behavior, and storage strategy must be defined by the backend team.

### 8.2 Roles

The project identifies these user roles: - Patient. - Receptionist or
registration staff. - Nurse or authorized clinical staff. - Doctor. -
Facility administrator. - Platform administrator, if required.

### 8.3 Authorization checks

For every protected backend request, verify: 1. The user is
authenticated. 2. The account is active. 3. The user has the required
role or permission. 4. The user belongs to, or is otherwise authorized
for, the requested facility. 5. The requested record belongs to the
authorized facility or is shared through an approved process. 6. The
requested action is permitted for that role and record state.

The frontend may hide unavailable actions for usability, but the backend
must enforce permissions independently.

### 8.4 Facility context

Where staff can access multiple facilities, requests must use a
validated facility context. Never trust a facility ID supplied by the
browser or mobile client without checking the user's membership and
permissions.

## 9. REST API Architecture

The Patient Mobile Application and Hospital Web Portal communicate with
Spring Boot through REST APIs over HTTPS.

Before implementing a feature, agree on: - Endpoint and HTTP method. -
Authentication requirement. - Required role and facility scope. -
Request fields and validation. - Response fields. - Error responses. -
Status transitions. - Pagination and filtering behavior.

### 9.1 Suggested API domain groups

These are conceptual API groups, not finalized endpoint contracts.

  -----------------------------------------------------------------------
  API domain                          Main operations
  ----------------------------------- -----------------------------------
  Authentication                      Login, logout, token validation,
                                      refresh if implemented

  Users and staff                     Profiles, staff membership, role
                                      and permission management

  Facilities                          Facility details, departments,
                                      services, facility context

  Patients                            Patient directory, patient details,
                                      patient-to-facility links

  Registrations                       Submit, review, approve, reject, or
                                      request correction

  Doctors                             Doctor directory, profile,
                                      specialty, availability

  Appointments                        Request, list, view, confirm,
                                      assign, reschedule, cancel

  Queue                               Check in, list queue, update visit
                                      status

  Documents                           Upload, list, view metadata,
                                      request authorized file access

  AI review                           Start processing, retrieve draft,
                                      submit human review

  Tasks and reports                   Task status, basic operational
                                      summaries

  Audit                               Record and review authorized audit
                                      events
  -----------------------------------------------------------------------

### 9.2 API contract collaboration

Because two frontend applications are developed separately: - The
backend developer should publish API endpoint documentation. - Use
Postman collections to share and test requests. - Keep request and
response examples in the repository. - Agree on status values before
implementing status badges and workflow buttons. - Use consistent error
response structures. - Version APIs if breaking changes become
necessary.

The mobile and web developers should not independently invent endpoint
paths or response field names.

## 10. File Storage and Medical Documents

Microsoft SQL Server should store document metadata and relationships.
The actual binary files should normally be stored in an appropriate
private file-storage service rather than as publicly accessible files.

The exact storage provider is not specified by the supplied technology
list and remains to be selected by the team.

The backend must: - Check user and facility permissions before issuing
file access. - Store file metadata and ownership context. - Validate
allowed file types and sizes. - Avoid exposing permanent public URLs for
sensitive records. - Record relevant upload and access events where
appropriate. - Preserve the original uploaded document.

The mobile app and web portal must access documents through authorized
backend-controlled flows.

## 11. AI and OCR Processing Architecture

AI services are supporting services coordinated by the Spring Boot
backend. Secret API keys must never be placed in mobile or browser code.

### 11.1 Document processing flow

``` mermaid
flowchart TD
    A[Authorized user uploads document] --> B[Spring Boot checks user and facility access]
    B --> C[Validate file type and size]
    C --> D[Store original in private storage]
    D --> E[OCR / text extraction]
    E --> F[AI prepares structured fields and draft summary]
    F --> G[Save draft and processing status]
    G --> H[Authorized staff or doctor reviews]
    H --> I{Approved or corrected?}
    I -->|Yes| J[Save verified information according to workflow]
    I -->|No| K[Keep as draft / request correction]
```

### 11.2 AI safety rules

-   AI-generated content must be labelled as a draft.
-   Preserve the link to the source document.
-   Show missing or uncertain information when available.
-   Require authorized human review before treating extracted content as
    verified clinical information.
-   AI must not independently diagnose.
-   AI must not independently determine clinical priority.
-   Do not fabricate confidence values or source details.
-   Keep AI provider credentials on the server.
-   Use synthetic, de-identified, or appropriately authorized test data.
-   Do not send real patient records to an external AI provider without
    an approved privacy, security, and legal basis.

The AI/OCR provider is not specified by the supplied stack and must be
selected separately.

## 12. Main End-to-End Workflow

The main product workflow is:

``` mermaid
flowchart TD
    A[Patient signs into MedKnot] --> B[Patient discovers a participating facility]
    B --> C[Patient submits facility registration]
    C --> D[Facility staff reviews registration]
    D --> E[Facility-specific patient record linked after verification]
    E --> F[Patient requests an appointment]
    F --> G[Facility confirms or assigns doctor / slot]
    G --> H[Patient checks in]
    H --> I[Staff updates queue and visit status]
    I --> J[Authorized staff process medical documents]
    J --> K[AI prepares draft extracted information and summary]
    K --> L[Authorized clinician reviews the draft]
    L --> M[Verified visit information is added to the permitted patient timeline]
```

The prototype may simulate selected steps. Clearly identify simulated
steps in the demo and do not present them as live integrations.

## 13. Four-Day Hospital Portal MVP Boundary

The immediate implementation target is the Hospital Web Portal MVP. The
full MedKnot product also includes the patient mobile application and
shared Java backend.

### Ayadee --- Hospital Web Portal M1 to M4

-   M1. Authentication & Dashboard.
-   M2. Patient Management.
-   M3. Appointment Management.
-   M4. Queue Management.
-   Initial shared web layout, Sidebar, Navbar, and reusable UI
    foundation.

### Shaili --- Hospital Web Portal M5 to M8

-   M5. Clinical & Facility Management.
-   M6. Medical Records.
-   M7. AI Medical Assistance.
-   M8. Operations & Administration.

### Mobile / Backend workstream

The mobile-development teammate is responsible for the React Native
patient application and the supplied Java/Spring Boot backend stack,
according to the team's agreed division of work.

The team must confirm whether the same teammate owns the shared backend
implementation or whether backend tasks are split separately.

### Shared integration rules

-   Agree on API contracts and database models before connecting
    dependent modules.
-   The web portal and mobile app call the same backend API.
-   Ayadee implements and documents the shared web frontend foundation
    first.
-   Shaili reuses that shared foundation rather than creating a second
    layout.
-   Backend changes must be communicated to both frontend workstreams.
-   Use mock data for features that cannot be fully integrated in the
    available time, and label it clearly.
-   Prioritize a consistent, navigable, demonstration-ready workflow
    over unfinished advanced integrations.

## 14. Repository and GitHub Workflow

The supplied repository screenshot shows this top-level structure:

``` text
MedKnot/
├── backend/
├── frontend/
│   └── hospital-portal/
└── .gitignore
```

Keep the existing repository structure unless the team agrees on a
change after inspecting the actual files.

Suggested documentation structure:

``` text
docs/
├── project-overview.md
├── design-system.md
├── ui-guidelines.md
└── architecture.md
```

### Branches

-   `main` --- stable integrated version.
-   `ayadee-dev` --- Ayadee's Hospital Web Portal work.
-   `shaili-dev` --- Shaili's Hospital Web Portal work.

If the mobile/backend teammate is also committing to this repository,
agree on a separate branch name for that workstream before they begin.
Do not have multiple developers commit directly to `main`.

### Collaboration rules

1.  Do not develop directly on `main`.
2.  Pull or fetch the latest relevant changes before starting work.
3.  Commit small, meaningful changes.
4.  Push work to the assigned branch.
5.  Use Pull Requests to merge into `main`.
6.  Review shared layout, routing, API contracts, database, and
    dependency changes carefully.
7.  Test affected routes and API requests after merging.
8.  Coordinate before changing shared components or API contracts.

## 15. Environment Configuration and Secrets

-   Keep database credentials, JWT secrets, and AI API keys in
    environment variables or an approved secret manager.
-   Do not commit `.env` files containing secrets.
-   Provide a safe `.env.example` with variable names and placeholder
    values only.
-   Configure SQL Server connection details outside source code.
-   Validate required configuration at application startup.
-   Use separate development and production credentials.
-   Never expose JWT signing secrets, database passwords, or private AI
    service keys in frontend code.
-   Do not place real patient data in source code, screenshots, logs, or
    sample fixtures.

The backend developer should document the exact environment variable
names and local SQL Server setup instructions.

## 16. Testing Strategy

### Patient Mobile Application

-   Login and token handling.
-   Registration forms.
-   Facility discovery.
-   Appointment request and status.
-   Queue status display.
-   Document upload and access.
-   Error and offline/network behavior.

### Hospital Web Portal

-   Route rendering.
-   Form validation.
-   Loading, empty, error, and success states.
-   Responsive layout.
-   Role-aware navigation and action visibility.
-   API error handling.

### Spring Boot Backend

-   Authentication and JWT validation.
-   Role and permission checks.
-   Facility-level access restrictions.
-   Input validation.
-   Correct status transitions.
-   DTO validation and error handling.
-   Service and repository behavior.
-   Transaction handling for multi-step operations.

### SQL Server and Storage

-   Correct entity relationships.
-   Facility record separation.
-   Patient-to-facility linking.
-   Private document access.
-   Correct ownership and metadata.
-   Audit event creation for important actions.

### API Testing with Postman

-   Maintain a shared Postman collection.
-   Test successful and unsuccessful authentication.
-   Test role and facility access boundaries.
-   Test each agreed request and response contract.
-   Include representative sample requests and responses.
-   Keep environment variables for local API base URL and test tokens;
    do not commit real secrets.

### End-to-end

Test the minimum demonstration journey from patient registration through
facility review, appointment, queue status, document handling, and human
review of AI output.

Use synthetic or appropriately authorized test data.

## 17. Architecture Decisions to Confirm

  -----------------------------------------------------------------------
  Decision                            Current status
  ----------------------------------- -----------------------------------
  Patient mobile frontend             React Native --- supplied by mobile
                                      teammate

  Backend language                    Java 21 --- supplied by mobile
                                      teammate

  Backend framework                   Spring Boot --- supplied by mobile
                                      teammate

  Database                            Microsoft SQL Server --- supplied
                                      by mobile teammate

  ORM / database connectivity         Spring Data JPA + Hibernate ---
                                      supplied by mobile teammate

  Authentication                      Spring Security + JWT --- supplied
                                      by mobile teammate

  Build tool                          Maven --- supplied by mobile
                                      teammate

  Backend IDE                         IntelliJ IDEA Community ---
                                      supplied by mobile teammate

  API testing                         Postman --- supplied by mobile
                                      teammate

  Hospital Web Portal                 Existing project; screenshot
                                      suggests Next.js --- verify
                                      `package.json`

  File storage provider               Not specified; team decision
                                      required

  OCR / AI provider                   Not specified; team decision
                                      required

  API endpoint and response contracts Must be agreed by mobile, backend,
                                      and web developers

  Deployment services                 Not specified; decide after the
                                      local prototype works
  -----------------------------------------------------------------------

### Important repository check before implementation

The earlier repository screenshot showed a `backend/` folder and a
previous commit description mentioning Supabase database access. This
architecture now documents the Java 21 + Spring Boot + SQL Server stack
supplied by the mobile teammate.

Before replacing or restructuring anything: 1. Inspect the current
`backend/` files and `pom.xml` or `package.json`. 2. Confirm whether a
Java Spring Boot backend already exists. 3. Confirm whether the current
backend contains working Supabase or Node.js code. 4. Agree as a team
whether to retain, migrate, or replace the existing backend. 5. Do not
delete a working backend or its data configuration until the team has
reviewed it and backed up required work.

------------------------------------------------------------------------

**End of Architecture Document**\
**Technology stack source:** Technology list supplied by the MedKnot
mobile-development teammate.\
**Product and workflow basis:** MedKnot project overview and
implementation workflow.
