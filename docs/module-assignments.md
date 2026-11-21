# MedKnot --- Module Assignments

**Project:** AI Smart Healthcare Triage & Care Management Platform\
**Application:** MedKnot\
**Scope:** Hospital Web Portal, Patient Mobile Application, and shared
backend\
**Document purpose:** Define module ownership, responsibilities,
deliverables, dependencies, and integration rules for the project team.

------------------------------------------------------------------------

## 1. Team Work Division

The project has three main workstreams:

  -----------------------------------------------------------------------
  Team member /           Main responsibility     Assigned scope
  workstream                                      
  ----------------------- ----------------------- -----------------------
  **Ayadee**              Hospital Web Portal --- M1--M4
                          patient and visit       
                          operations              

  **Shaili**              Hospital Web Portal --- M5--M8
                          clinical records and    
                          administration          

  **Mobile / Backend      Patient Mobile          React Native mobile
  teammate**              Application and shared  application; Java 21 +
                          backend                 Spring Boot backend;
                                                  SQL Server integration
  -----------------------------------------------------------------------

**Important:** The mobile and web applications are two interfaces of the
same MedKnot platform. They must use the same backend API and shared
business rules. The mobile app must not create a separate copy of the
backend or database logic.

The exact division of backend tasks should be confirmed with the
teammate. This document assigns the mobile application and the supplied
Java/Spring Boot stack to that workstream; it does not assume that every
backend task has already been allocated to one person.

## 2. Hospital Web Portal --- Module Ownership

  -----------------------------------------------------------------------
  Module            Name              Owner             Priority
  ----------------- ----------------- ----------------- -----------------
  M1                Authentication &  Ayadee            Must-have
                    Dashboard                           

  M2                Patient           Ayadee            Must-have
                    Management                          

  M3                Appointment       Ayadee            Must-have
                    Management                          

  M4                Queue Management  Ayadee            Must-have

  M5                Clinical &        Shaili            Must-have
                    Facility                            
                    Management                          

  M6                Medical Records   Shaili            Must-have

  M7                AI Medical        Shaili            Main AI feature
                    Assistance                          

  M8                Operations &      Shaili            Must-have
                    Administration                      supporting module
  -----------------------------------------------------------------------

The module names and order follow the current Hospital Web Portal
architecture. They are not eight separate applications; they are feature
areas inside one web portal.

------------------------------------------------------------------------

# 3. Ayadee --- Hospital Web Portal (M1--M4)

## Shared responsibility before M1

Ayadee owns the initial shared frontend foundation for the Hospital Web
Portal. Shaili should reuse this foundation for M5--M8.

### Shared frontend foundation

-   Set up or maintain the existing Hospital Web Portal project.
-   Establish the main authenticated dashboard layout.
-   Build the reusable `DashboardLayout`.
-   Build the shared `Sidebar`.
-   Build the shared `Navbar`.
-   Set up the shared page/container structure.
-   Establish reusable UI components and consistent styling.
-   Set up shared route and navigation conventions.
-   Apply the approved MedKnot design system and UI guidelines.
-   Document how Shaili should use the shared layout and components.

**Shared components must be implemented once.** Do not create another
Sidebar, Navbar, or DashboardLayout inside Shaili's modules.

## M1 --- Authentication & Dashboard

**Owner:** Ayadee\
**Purpose:** Provide the entry point and main workspace for authorized
hospital staff.

### Responsibilities

-   Login page.
-   Forgot-password page/interface.
-   Authenticated dashboard landing page.
-   Shared dashboard layout.
-   Sidebar and Navbar.
-   User profile/menu area.
-   Facility context display where available.
-   Role-aware navigation presentation.
-   Dashboard summary cards or placeholders based on available data.
-   Loading, error, empty, and success states.

### Routes

-   `/login`
-   `/forgot-password`
-   `/dashboard`

### Dependencies

-   Backend authentication contract.
-   Agreed JWT/session handling approach.
-   Agreed user roles and facility context.
-   Shared design system.

### Deliverables

-   Working login interface connected to the agreed authentication API
    when available.
-   Protected dashboard routes.
-   Reusable layout components.
-   Navigation structure that can be reused by M2--M8.

### Acceptance criteria

-   Staff can reach the login page.
-   Successful authentication leads to the dashboard.
-   Unauthenticated users cannot access protected portal routes.
-   Navigation is consistent across modules.
-   Sidebar items can be shown or hidden according to the agreed role
    rules.
-   Loading and error states are handled clearly.

**Security note:** Hiding a route or navigation item in the frontend is
not sufficient authorization. The Spring Boot backend must enforce
access permissions.

## M2 --- Patient Management

**Owner:** Ayadee\
**Purpose:** Allow authorized staff to view patient records and process
facility registration requests.

### Responsibilities

-   Patient list/directory.
-   Patient search and filtering.
-   Patient detail view.
-   Patient profile information.
-   Registration request list.
-   Registration request review.
-   Approve, reject, or request-correction actions, according to the
    agreed workflow.
-   Registration status display.
-   Empty, loading, and error states.

### Routes

-   `/dashboard/patients`
-   `/dashboard/patients/[patientId]`
-   `/dashboard/registrations`

### Main data concepts

-   `Patient`
-   `FacilityPatient`
-   `RegistrationRequest`
-   `Facility`

### Dependencies

-   M1 shared layout and authentication.
-   Backend patient and registration API contracts.
-   Facility-level access rules.
-   Agreed registration status values.

### Deliverables

-   Patient directory interface.
-   Patient details interface.
-   Registration review interface.
-   Status and action feedback.

### Acceptance criteria

-   Authorized staff can view permitted patient records.
-   Staff can find a patient using agreed search/filter fields.
-   Staff can review registration requests.
-   Registration status is displayed accurately.
-   A facility cannot access another facility's private patient records
    unless access is explicitly authorized.

## M3 --- Appointment Management

**Owner:** Ayadee\
**Purpose:** Help facility staff review, assign, and manage patient
appointment requests.

### Responsibilities

-   Appointment list.
-   Appointment detail view.
-   Search and filtering by agreed fields.
-   Appointment status badges.
-   Review appointment requests.
-   Confirm or reject requests.
-   Request additional information where supported.
-   Assign a doctor or slot when the facility workflow requires it.
-   Reschedule and cancel actions where supported.
-   Appointment date/time display.
-   Calendar or list presentation according to the agreed MVP scope.

### Routes

-   `/dashboard/appointments`
-   `/dashboard/appointments/[appointmentId]`

### Main data concepts

-   `Appointment`
-   `DoctorProfile`
-   `Specialty`
-   `Service`
-   `AvailabilitySlot`

### Dependencies

-   M1 authentication and shared layout.
-   M2 patient and facility records.
-   Backend appointment API.
-   M5 doctor and specialty data.
-   Agreed appointment statuses and facility-specific scheduling rules.

### Deliverables

-   Appointment list.
-   Appointment detail/review view.
-   Appointment status and action controls.
-   Clear feedback after each action.

### Acceptance criteria

-   Staff can view appointment requests for their authorized facility.
-   Staff can perform only the actions allowed by the appointment's
    current status and their role.
-   The patient-facing status reflects the backend's confirmed state.
-   An appointment request is not shown as confirmed before the facility
    confirms it.
-   The interface supports the facility's configured workflow.

## M4 --- Queue Management

**Owner:** Ayadee\
**Purpose:** Help staff manage check-ins and visit progress while
allowing patients to see permitted queue status through the mobile app.

### Responsibilities

-   Queue board/list.
-   Patient check-in status.
-   Queue position or ordering where supported by the agreed rules.
-   Update visit status.
-   Show statuses such as checked in, waiting, in consultation, and
    completed.
-   Search/filter queue entries.
-   Display approximate waiting-time information only when the backend
    provides a defensible estimate.
-   Clearly label estimates as approximate.

### Route

-   `/dashboard/queue`

### Main data concepts

-   `QueueEntry`
-   `QueueEvent`
-   `Encounter`
-   `Appointment`

### Dependencies

-   M2 patient records.
-   M3 appointment data.
-   Backend queue API.
-   Agreed queue status transitions.
-   Facility workflow rules.

### Deliverables

-   Staff queue board.
-   Queue status controls.
-   Status update feedback.
-   Empty and error states.

### Acceptance criteria

-   Authorized staff can view the correct facility queue.
-   Staff can update a patient's visit status according to allowed
    transitions.
-   Queue changes are reflected by the backend.
-   Patients see only the queue information they are permitted to
    access.
-   Estimated waiting time is not presented as a guarantee.
-   AI does not independently decide clinical priority.

------------------------------------------------------------------------

# 4. Shaili --- Hospital Web Portal (M5--M8)

**Important:** Shaili should build on Ayadee's shared `DashboardLayout`,
`Sidebar`, `Navbar`, and reusable UI components. Shaili owns the feature
pages and module-specific components for M5--M8.

## M5 --- Clinical & Facility Management

**Owner:** Shaili\
**Purpose:** Manage facility clinical setup and the doctor/service
information used by appointment workflows.

### Responsibilities

-   Doctor list.
-   Doctor profile/details.
-   Add/edit doctor interface if included in the agreed scope.
-   Department management.
-   Specialty/service information.
-   Doctor-to-department or specialty relationships.
-   Facility settings page.
-   Availability information if included in the backend contract.

### Routes

-   `/dashboard/doctors`
-   `/dashboard/departments`
-   `/dashboard/settings/facility`

### Main data concepts

-   `DoctorProfile`
-   `Specialty`
-   `Department`
-   `Service`
-   `AvailabilitySlot`
-   `Facility`

### Dependencies

-   Ayadee's shared dashboard layout and navigation.
-   Backend doctor, department, service, and facility APIs.
-   M3 appointment workflow and data requirements.
-   Agreed role permissions.

### Deliverables

-   Doctor management pages.
-   Department management page.
-   Facility settings page.
-   Reusable clinical/facility form components where appropriate.

### Acceptance criteria

-   Authorized staff can view the clinical/facility information
    permitted to them.
-   Forms validate required fields.
-   Changes are reflected through the backend when the API is available.
-   Doctor and service information is consistent with appointment
    workflows.

## M6 --- Medical Records

**Owner:** Shaili\
**Purpose:** Give authorized staff a structured interface to review
patient medical documents and related records.

### Responsibilities

-   Medical document list.
-   Document detail view.
-   Search/filter by agreed fields.
-   Document category and date display.
-   Patient and facility association display.
-   Document preview/download through authorized backend flows.
-   Review status display.
-   Clear distinction between AI-extracted, staff-reviewed, and
    clinician-verified information.
-   Empty, loading, and error states.

### Routes

-   `/dashboard/documents`
-   `/dashboard/documents/[documentId]`

### Main data concepts

-   `MedicalDocument`
-   `Encounter`
-   `TreatmentRecord`
-   `MedicationRecord`
-   `DocumentReview`

### Dependencies

-   Backend document metadata API.
-   Private file-storage and authorized access approach.
-   M2 patient records.
-   Facility-level authorization.
-   M7 AI review status, where integrated.

### Deliverables

-   Medical document list.
-   Document detail/review interface.
-   Document status indicators.
-   Authorized document access flow.

### Acceptance criteria

-   Staff can access only documents they are authorized to view.
-   Original document information is preserved.
-   The interface identifies the source and review status of extracted
    information.
-   The UI does not present an AI draft as a verified clinical record.

## M7 --- AI Medical Assistance

**Owner:** Shaili\
**Purpose:** Provide a staff-facing interface for reviewing AI-assisted
document extraction and pre-consultation summaries.

### Responsibilities

-   AI review page.
-   List of documents or jobs awaiting review.
-   Display extracted fields.
-   Display draft pre-consultation summaries.
-   Show source document references.
-   Highlight missing or uncertain information when supplied by the
    backend.
-   Allow authorized staff to correct or review draft fields.
-   Approve, return, or request correction according to the agreed
    workflow.
-   Clearly label AI-generated content as draft content.

### Route

-   `/dashboard/ai-review`

### Main data concepts

-   `AIProcessingJob`
-   `ExtractedDocumentField`
-   `DocumentReview`
-   `AISummary`
-   `Encounter`

### Dependencies

-   M6 medical document workflow.
-   Backend OCR/AI processing API.
-   Agreed AI output and review response formats.
-   Authorized clinician/staff roles.
-   Source-document access.

### Deliverables

-   AI review queue.
-   Draft extraction detail view.
-   Source-linked summary view.
-   Human review and correction interface.

### Acceptance criteria

-   AI-generated information is clearly labelled as a draft.
-   The reviewer can access the source document.
-   Uncertain or missing values are not silently treated as verified.
-   Review actions are recorded by the backend.
-   AI does not independently diagnose, prescribe, or determine clinical
    priority.

**Scope note:** Shaili owns the Hospital Web Portal's AI review
interface. The AI/OCR service implementation and API integration must be
assigned explicitly within the backend/AI workstream; this document does
not assume Shaili is building the AI model or service.

## M8 --- Operations & Administration

**Owner:** Shaili\
**Purpose:** Give facility administrators and staff a workspace for
pending operational tasks, basic reports, and staff/facility settings.

### Responsibilities

-   Staff task list.
-   Task status display and updates where supported.
-   Basic operational reports/metrics.
-   General settings page.
-   Staff management page.
-   Role-aware actions.
-   Notification/status display where included in the backend contract.
-   Loading, empty, and error states.

### Routes

-   `/dashboard/tasks`
-   `/dashboard/reports`
-   `/dashboard/settings`
-   `/dashboard/settings/staff`

### Main data concepts

-   `StaffTask`
-   `Notification`
-   `StaffMembership`
-   `Role`
-   `AuditEvent`

### Dependencies

-   M1 authentication and role information.
-   Backend task, staff, report, and notification APIs.
-   M2--M7 workflow data.
-   Agreed staff permissions.

### Deliverables

-   Pending task page.
-   Basic reports page.
-   Settings page.
-   Staff management page.

### Acceptance criteria

-   Authorized staff can view their permitted tasks.
-   Task status changes are reflected by the backend.
-   Reports use actual backend data or are clearly labelled as
    sample/demo data.
-   Staff management actions follow role permissions.
-   The portal does not imply that unsupported notifications or
    integrations are live.

------------------------------------------------------------------------

# 5. Mobile / Backend Teammate --- Patient App and Shared Services

**Owner:** Mobile / Backend workstream\
**Mobile technology:** React Native\
**Backend technology:** Java 21 + Spring Boot\
**Database:** Microsoft SQL Server\
**Database access:** Spring Data JPA + Hibernate\
**Authentication:** Spring Security + JWT\
**Build:** Maven\
**API testing:** Postman\
**IDE:** IntelliJ IDEA Community

## A. Patient Mobile Application

### Responsibilities

-   Patient registration and sign-in.
-   Patient profile.
-   Facility discovery.
-   Facility-specific registration.
-   Appointment request and status.
-   Queue and visit status.
-   Medical document upload and access.
-   Patient health timeline.
-   Patient-facing guided intake or report explanation, if selected for
    the prototype.
-   Mobile API integration and error handling.

## B. Shared Backend

### Responsibilities

-   REST APIs for both frontend applications.
-   Authentication and JWT validation.
-   Role-based access control.
-   Facility-level authorization.
-   Patient and facility registration workflows.
-   Doctor and specialty data APIs.
-   Appointment management.
-   Queue and visit status.
-   Medical document metadata and authorized file access.
-   AI/OCR processing integration or orchestration, according to the
    agreed AI work split.
-   Staff tasks, notifications, and operational data APIs.
-   Audit events and input validation.

## C. Database

### Responsibilities

-   SQL Server database configuration.
-   JPA entities and repository layer.
-   Hibernate mapping.
-   Database relationships and constraints.
-   Schema migration or controlled schema management.
-   Seed/demo data.
-   Transaction handling.
-   Facility-level data separation.

## D. Shared integration deliverables

The mobile/backend workstream should provide the web team with:

1.  Backend base URL for the development environment.
2.  Authentication and JWT usage instructions.
3.  API endpoint list.
4.  Request and response examples.
5.  Required roles and facility permissions for each endpoint.
6.  Status values and allowed status transitions.
7.  Error response format.
8.  Postman collection or equivalent API test documentation.
9.  Database field definitions for frontend-relevant data.
10. Instructions for running the backend locally.

------------------------------------------------------------------------

# 6. Shared Ownership and Dependencies

Some features cross module boundaries. The module owner builds the
assigned interface, while the backend owner supplies the shared API and
business rules.

  -----------------------------------------------------------------------
  Feature                 Web interface owner     Backend / service
                                                  responsibility
  ----------------------- ----------------------- -----------------------
  Login and staff access  Ayadee (M1)             Mobile/backend
                                                  workstream

  Patient directory and   Ayadee (M2)             Mobile/backend
  registration review                             workstream

  Appointment management  Ayadee (M3)             Mobile/backend
                                                  workstream

  Queue board             Ayadee (M4)             Mobile/backend
                                                  workstream

  Doctors and facility    Shaili (M5)             Mobile/backend
  setup                                           workstream

  Medical document review Shaili (M6)             Mobile/backend
                                                  workstream

  AI review interface     Shaili (M7)             AI/backend owner to be
                                                  confirmed

  Tasks, reports, staff   Shaili (M8)             Mobile/backend
  settings                                        workstream

  Patient mobile          Mobile teammate         Shared backend
  experience                                      

  SQL Server and          Not a web frontend task Mobile/backend
  JPA/Hibernate                                   workstream or
                                                  explicitly assigned
                                                  backend owner

  OCR/AI service          Staff review UI: Shaili AI/backend owner to be
                                                  confirmed
  -----------------------------------------------------------------------

**Ownership means responsibility for the assigned deliverable, not
permission to change shared contracts without coordination.**

------------------------------------------------------------------------

# 7. Integration Order and Dependencies

The modules should be developed in the following dependency order:

``` mermaid
flowchart TD
    A[Shared Web Foundation: Layout, Sidebar, Navbar] --> B[M1 Authentication and Dashboard]
    B --> C[M2 Patient Management]
    C --> D[M3 Appointment Management]
    D --> E[M4 Queue Management]
    B --> F[M5 Clinical and Facility Management]
    C --> G[M6 Medical Records]
    G --> H[M7 AI Medical Assistance]
    D --> I[M8 Operations and Administration]
    E --> I
    F --> D
    G --> I
    H --> I
    J[Shared Spring Boot API and SQL Server] --> B
    J --> C
    J --> D
    J --> E
    J --> F
    J --> G
    J --> H
    J --> I
```

### Recommended collaboration sequence

1.  Ayadee establishes the shared Hospital Web Portal layout and
    navigation.
2.  Ayadee shares setup instructions and reusable components with
    Shaili.
3.  The backend teammate shares authentication and API contracts.
4.  Ayadee and Shaili develop their assigned modules using agreed mock
    data or live APIs.
5.  The mobile/backend teammate develops the shared API and patient app.
6.  The team connects each module to the shared API as endpoints become
    available.
7.  The team tests role permissions and facility-level data separation.
8.  The team runs the complete patient-to-facility demonstration.

The web frontend and mobile app can be developed in parallel after the
API contracts and data models are agreed.

------------------------------------------------------------------------

# 8. API Contract Rules

Before a frontend module connects to the backend, the relevant
developers must agree on:

-   Endpoint path and HTTP method.
-   Authentication requirement.
-   Required role and facility context.
-   Request body and query parameters.
-   Response fields and data types.
-   Status values and allowed transitions.
-   Validation rules.
-   Error response structure.
-   Pagination and filtering behavior.
-   Example successful and unsuccessful requests.

Use Postman to test and share API behavior. Do not let each frontend
developer invent their own endpoint names, field names, or status
labels.

If an endpoint is not ready, use a clearly labelled mock service or
sample dataset. Keep mock data separate from production API code so it
can be replaced cleanly.

------------------------------------------------------------------------

# 9. GitHub Collaboration

Use the existing repository and branch naming agreed by the team.

Suggested branches:

  -----------------------------------------------------------------------
  Branch                              Owner / purpose
  ----------------------------------- -----------------------------------
  `main`                              Stable integrated project

  `ayadee-dev`                        Ayadee's Hospital Web Portal
                                      modules

  `shaili-dev`                        Shaili's Hospital Web Portal
                                      modules

  Backend/mobile branch               Name to be agreed with the
                                      mobile/backend teammate
  -----------------------------------------------------------------------

### Git rules

1.  Do not develop directly on `main`.
2.  Pull the latest relevant changes before starting work.
3.  Commit small, meaningful changes.
4.  Push work to the assigned branch.
5.  Merge through Pull Requests.
6.  Review changes to shared layout, routing, dependencies, API
    contracts, and database configuration.
7.  Test affected pages and API requests after integration.
8.  Do not overwrite another teammate's work.
9.  Communicate before changing shared components or API contracts.

------------------------------------------------------------------------

# 10. Definition of Done

A module is considered complete when:

-   Its agreed screens and routes are implemented.
-   It follows the MedKnot design system and UI guidelines.
-   It reuses the shared dashboard layout and components.
-   Loading, empty, success, and error states are handled.
-   Forms have appropriate validation.
-   Role-aware actions are presented correctly.
-   Backend authorization is enforced for protected data and operations.
-   API integration works, or mock data is clearly identified.
-   The module has been tested with representative scenarios.
-   No unrelated module or shared component is broken.
-   Setup or integration notes are documented.
-   The work is pushed to the assigned branch and ready for review.

------------------------------------------------------------------------

# 11. Final Team Responsibility Summary

  -----------------------------------------------------------------------
  Person / workstream                 Main deliverable
  ----------------------------------- -----------------------------------
  **Ayadee**                          Shared Hospital Web Portal
                                      foundation + M1 Authentication &
                                      Dashboard + M2 Patient Management +
                                      M3 Appointment Management + M4
                                      Queue Management

  **Shaili**                          M5 Clinical & Facility Management +
                                      M6 Medical Records + M7 AI Medical
                                      Assistance interface + M8
                                      Operations & Administration

  **Mobile / Backend teammate**       React Native Patient Mobile
                                      Application + Java 21/Spring Boot
                                      shared backend + SQL
                                      Server/JPA/Hibernate + Spring
                                      Security/JWT + API contracts and
                                      Postman testing
  -----------------------------------------------------------------------

## Final integration goal

The team should be able to demonstrate one connected workflow:

**Patient registers in the mobile app → selects a facility → submits
registration → staff reviews it in the Hospital Web Portal → patient
requests an appointment → staff confirms or assigns the appointment →
staff checks in the patient and updates the queue → authorized staff
review medical documents → AI prepares draft information → an authorized
clinician reviews it.**

The project should demonstrate a reliable end-to-end prototype before
expanding into advanced AI, predictive queue estimates, or real
hospital-system integrations.

------------------------------------------------------------------------

**End of Module Assignments Document**
