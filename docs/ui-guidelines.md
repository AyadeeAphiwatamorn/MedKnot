# MedKnot --- UI Guidelines

**Document:** `ui-guidelines.md`\
**Product:** MedKnot --- AI Smart Healthcare Triage & Care Management
Platform\
**Applies to:** Hospital Web Portal\
**Primary references:** Approved MedKnot Stitch screens,
`design-system.md`, `project-overview.md`, and existing shared project
components.

------------------------------------------------------------------------

## 1. Purpose and Source of Truth

This document defines how to design and implement the MedKnot Hospital
Web Portal consistently. It covers the shared application shell,
authentication screens, dashboard pages, Staff Management, forms,
tables, interaction states, responsive behavior, and implementation
rules.

Use this document together with:

-   `project-overview.md` --- product scope, modules, routes, and team
    responsibilities.
-   `design-system.md` --- official CI colors, typography, logo,
    iconography, and design tokens.
-   Approved Stitch screens --- page-specific visual references.
-   Existing source code --- current routing, components, and project
    conventions.

**Precedence:** The official CI and `design-system.md` define the brand.
Approved Stitch screens define the intended page layout and visual
composition. Existing code defines current implementation conventions.
If these sources conflict, do not silently invent a new style; discuss
the conflict with the team.

The supplied Staff Management screen and Account Verification screen are
the current visual references described in this document.

## 2. Product and Portal Context

The Hospital Web Portal is used by hospital administrators, doctors,
nursing staff, and receptionists.

The interface must help users complete clinical and administrative tasks
accurately and efficiently. Prioritize:

-   Clear information hierarchy.
-   Fast access to frequent tasks.
-   Readable patient and appointment information.
-   Consistent navigation.
-   Clear status and permission feedback.
-   Safe handling of sensitive patient information.

The portal is a multi-role application. Users should only see
information and actions permitted for their role and facility. Frontend
visibility is not a substitute for backend authorization.

## 3. Visual Direction

The Hospital Web Portal should feel professional, calm, clear,
trustworthy, and approachable.

Follow the MedKnot CI: - Fresh Blue `#015CA9` for primary actions and
active navigation. - Creamy Avocado `#DFEEA9` for soft brand
highlights. - Light Blue `#E1F2FD` for secondary and information
surfaces. - Soft White `#F8FAF6` for the main application background. -
Sage Green `#A3C8B4` for supportive accents. - Soft Yellow `#FAE193` for
gentle attention cues. - Inter as the official typeface.

The supplied Staff Management reference has a pale green page
background, white content cards, blue primary actions, compact status
pills, and a dense administrative table. Preserve this overall
composition while implementing the official Inter typography and CI
tokens from `design-system.md`. Do not introduce an unrelated serif font
because it appears in a screenshot rendering.

Avoid heavy shadows, unnecessary gradients, excessive decoration, and
large areas of saturated color.

## 4. Shared Authenticated Application Layout

All authenticated dashboard pages must use one shared application shell.

### 4.1 Layout structure

``` text
Hospital Portal
├── Sidebar
│   ├── MedKnot brand
│   ├── Dashboard
│   ├── Patients
│   ├── Appointments
│   ├── Queue Management
│   ├── Medical Records
│   ├── Staff Management
│   ├── Facility Settings
│   └── My Profile
│
├── Top Navbar
│   ├── Hospital / facility selector
│   ├── Campus or facility context (when applicable)
│   ├── Notifications
│   └── User name, role, and avatar
│
└── Main Content
    ├── Breadcrumbs
    ├── Page title and description
    ├── Context badges and primary actions
    └── Page-specific content
```

This represents the navigation visible in the supplied Staff Management
reference. The final menu may include additional agreed routes, but must
be consistent and permission-aware. Do not create a different navigation
shell for each module.

### 4.2 Sidebar

The Sidebar must:

-   Remain consistent across authenticated pages.
-   Display the approved MedKnot brand mark and portal label.
-   Use one consistent icon family and icon size.
-   Highlight the active route with a Fresh Blue background and readable
    contrasting text.
-   Use clear labels alongside icons on desktop.
-   Keep the signed-in user's identity and sign-out action in a bottom
    account area when space permits.
-   Support a compact or collapsed state only if implemented
    consistently.
-   Hide navigation items the current user is not authorized to access.

The active item should be visually distinct but should not rely on color
alone.

### 4.3 Top Navbar

The top navigation bar may contain:

-   Hospital or facility selector.
-   Campus label or facility context badge.
-   Notification icon with an unread indicator.
-   User name, role, and avatar.

Use the facility selector only when the user has access to multiple
facilities or campuses. Show the active facility context clearly so
staff understand which facility they are working in.

The notification indicator must reflect actual unread state. Do not
display a permanent red dot if notification functionality is not
implemented.

### 4.4 Main content area

Use a consistent content container with comfortable horizontal and
vertical spacing.

Recommended order: 1. Breadcrumbs. 2. Page title and optional
version/status badge. 3. Short page description. 4. Context or scope
badges, if useful. 5. Primary and secondary actions. 6. Summary cards,
if they help the task. 7. Search and filters. 8. Main table, form, or
detail content.

Keep primary actions near the page title. Avoid crowding the header with
too many buttons or badges.

## 5. Authentication Screens

Authentication pages use a distinct layout from the authenticated
dashboard. They must not display the dashboard Sidebar or authenticated
Navbar.

### 5.1 General authentication layout

Use a clean, centered authentication experience with: - MedKnot symbol
and wordmark. - Hospital Portal label. - Short, reassuring
explanation. - Clearly grouped form fields. - One prominent primary
action. - Relevant security or help information. - Responsive behavior
for smaller screens.

### 5.2 Account Verification --- reference screen

The supplied Account Verification design uses a two-column card layout.

**Overall composition** - Soft White / pale background around the main
card. - Large rounded outer container. - Left brand and reassurance
panel. - Right verification form panel. - Subtle border and shadow. - A
compact demo-state selector may appear above the card during prototype
demonstrations only.

**Left brand panel** - MedKnot symbol and wordmark near the top. -
"Hospital Portal" label. - Tagline: "Connected care. Brighter lives." -
A centered brand symbol inside a white rounded-square tile. - Short
heading: "One secure step to get started." - Supporting explanation
about verifying contact information. - Footer information for authorized
healthcare professionals.

**Right verification panel** - Small "Account Verification" label. -
Gate or verification status indicator. - Heading: "Verify your
account". - Short instruction explaining where the code was sent. -
Verification destination card with masked email or phone number. -
"Change method" action, only if supported. - Six-digit verification code
input. - Resend-code action with countdown. - Primary "Verify Account"
button. - Security guidance panel. - Contact administrator help text.

**Verification behavior** - Treat the six code boxes as one logical
six-digit code input. - Support keyboard entry, paste, and focus
movement between digits. - Do not log or expose verification codes. -
Show invalid, expired, too-many-attempts, and success states clearly. -
Disable or throttle resend behavior according to backend rules. -
Display a countdown only when a real resend cooldown is active. - Mask
contact details by default. - Never claim an account is verified until
the backend confirms success.

The demo-state selector shown above the reference screen is for design
review or prototype demonstration. It must not appear in the production
user flow unless the team explicitly approves a safe internal testing
mode.

### 5.3 Authentication security messaging

Security statements must be accurate and approved. Do not claim "HIPAA
compliant", "SOC 2 certified", "HIPAA & SOC-2 Ready", or equivalent
certification unless the organization has verified and authorized that
claim. A visual reference is not proof of compliance.

## 6. Staff Management --- Reference Page

The supplied Staff Management screen is the primary reference for
administrative directory pages.

### 6.1 Page header

The header contains: - Breadcrumb: `Home > Staff Management`. - Page
title: `Staff Management`. - Optional version/status badge, such as
`v2.4 Live`, only when meaningful. - Short description explaining staff
credentials, facility permissions, departments, and onboarding. -
Facility scope badge. - User role/context badge. - Secondary action such
as `Export Directory`. - Primary action such as `Invite Staff`.

Keep the title and description on the left and page-level actions on the
right on wide screens. Stack actions beneath the title on smaller
screens.

### 6.2 Summary metric cards

The reference contains four summary cards:

1.  **Total Staff** --- total registered staff accounts.
2.  **Active Members** --- active or currently authorized accounts.
3.  **Invitations Pending** --- invitations awaiting activation.
4.  **Suspended** --- temporarily deactivated accounts.

Each card may include: - Small uppercase or compact label. - Prominent
numeric value. - Short explanatory text. - Optional supporting status or
icon. - Subtle bottom indicator.

Metric values must come from the data source. If using mock data for the
MVP, identify it as demo data in the implementation or demo context. Do
not calculate or display percentages unless the underlying values and
formula are correct.

### 6.3 Search and filter toolbar

Place the search and filters in one horizontal toolbar below the summary
cards.

Reference controls: - Search by staff name, work email, or Staff ID. -
Role filter. - Department filter. - Account status filter. - Optional
clear/reset filters control.

Behavior: - Search should update the displayed results. - Filters should
work together. - Show active filter state. - Provide a clear/reset
option. - Show a no-results state when nothing matches. - Do not show
decorative filters that do not work.

On narrow screens, allow filters to wrap or move into a filter panel.
Keep search easy to access.

### 6.4 Staff directory table

The reference table uses these columns:

  Column           Content
  ---------------- -----------------------------------------------------------
  Staff Member     Avatar, full name, and work email
  Staff ID         Unique staff identifier
  Role             Physician, Nursing Staff, Reception, Hospital Admin, etc.
  Department       Assigned department
  Account Status   Active, Invitation Pending, Suspended, etc.
  Actions          View and permitted account actions

Table rules: - Keep column headings clear and consistent. - Align values
consistently. - Use compact role and status badges. - Keep names
visually stronger than email addresses. - Use a unique Staff ID where
available. - Keep row actions in a predictable final column. - Provide
pagination when the dataset is larger than one page. - Show the current
range and total record count. - Support horizontal scrolling or a
responsive alternative on smaller screens.

### 6.5 Account status presentation

Use text labels with status colors. The reference includes:

-   **Active:** green status pill.
-   **Invitation Pending:** blue status pill, optionally with an expiry
    message.
-   **Suspended:** red status pill.

Additional rules: - A pending invitation may expose `Resend Invite` if
the user has permission and the invitation is eligible. - A suspended
account may expose `Reactivate` if the user has permission. - A
protected self-account may show a `Protected` indicator instead of
destructive actions. - Do not allow a user to suspend or remove their
own protected administrator account unless an approved policy explicitly
permits it.

Do not communicate account status by color alone.

### 6.6 Row actions and staff details

-   `View` opens the staff detail view.
-   Overflow menus contain secondary actions.
-   Actions must be role- and permission-aware.
-   Confirm sensitive or destructive actions.
-   Explain why an action is unavailable when helpful.
-   Never expose private account or credential information in the
    directory table.

### 6.7 Export and invite actions

**Export Directory** - Export only fields the current user is authorized
to access. - Indicate when export is in progress or complete. - Handle
empty results and export errors.

**Invite Staff** - Open a dedicated invitation form or modal. - Collect
only required information. - Include role and department assignment
where applicable. - Validate email and required fields. - Explain the
invitation status after submission. - Prevent duplicate invitations
where the backend supports that check.

## 7. Other Page Patterns

Use shared page patterns so all modules feel like one product.

### 7.1 Directory / listing pages

Examples: - Patient Directory. - Appointment List. - Doctor Directory. -
Department List. - Medical Documents. - Staff Directory.

Recommended structure: 1. Page title and description. 2. Primary action,
if applicable. 3. Search field. 4. Relevant filters. 5. Table or list.
6. Pagination, if required.

Directory pages should support loading, empty, error, and no-results
states.

### 7.2 Detail pages

Examples: - `/dashboard/patients/[patientId]` -
`/dashboard/appointments/[appointmentId]` -
`/dashboard/documents/[documentId]`

Recommended structure: 1. Breadcrumb or back link. 2. Record title and
unique identifier, where appropriate. 3. Current status. 4. Key
information summary. 5. Related information grouped into sections. 6.
Available actions based on permissions.

Provide loading, not-found, and error states.

### 7.3 Forms

-   Use visible labels.
-   Mark required fields clearly.
-   Group related fields into sections.
-   Use suitable input types and validation.
-   Explain errors next to the relevant field.
-   Preserve entered information when validation fails.
-   Prevent duplicate submissions while saving.
-   Show clear success or failure feedback.
-   Confirm destructive actions.
-   Do not use placeholder text as the only label.

### 7.4 Dashboard

Prioritize useful operational information: - Today's appointments. -
Patients waiting or requiring attention. - Pending registration
requests. - Pending administrative tasks. - Recent relevant activity.

Only display metrics supported by real data or clearly identified mock
data.

### 7.5 Queue Management

Show only the information needed for the user's role, such as: - Queue
number or reference. - Patient identifier or approved display name. -
Appointment or check-in time. - Current status. - Assigned department or
doctor, if relevant. - Permitted queue actions.

Use clear labels for waiting, called, in consultation, and completed. Do
not imply real-time updates unless the system actually updates in real
time.

### 7.6 Medical Documents

Make it clear: - Which patient the document belongs to. - Document type
and date. - Source or upload information, where available. - Processing
or review status. - Whether content is original or AI-extracted.

Restrict access according to user permissions. Do not expose sensitive
documents through public routes or unprotected file URLs.

### 7.7 AI Review

Clearly distinguish: - Original source document. - Extracted text or
fields. - AI-generated summary. - Missing or uncertain information. -
Human review status. - Reviewer actions.

AI output is decision-support information, not a diagnosis. An
authorized healthcare professional must review and verify information
before it is used in care workflows. Do not fabricate confidence scores,
clinical findings, or processing results.

## 8. Navigation and Routes

Use the agreed MVP routes consistently.

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

Route behavior: - Protect authenticated routes. - Redirect
unauthenticated users to login. - Check permissions before displaying
protected content or allowing protected actions. - Dynamic detail routes
must load the correct record from the route parameter. - Provide a
not-found state when a record does not exist. - Use breadcrumbs on
nested pages when helpful.

## 9. Role-Based UI Behavior

The portal supports different roles. Use the same shared application
shell, but show only approved navigation items and actions.

### Hospital Administrator

May access approved functions such as staff management, roles and
permissions, facility settings, reports, and operational oversight.

### Doctor

May access approved clinical functions such as assigned patients,
appointments, queue or visit information, authorized medical records, AI
review, and follow-up tasks.

### Nursing Staff

May access approved care-support functions such as assigned patient
information, patient intake, check-in and queue workflows, and permitted
patient updates.

### Receptionist

May access approved front-desk functions such as patient registration,
appointment requests, check-in, and queue monitoring.

**Security rule:** The backend must enforce authorization. Hiding a
button in the frontend is not sufficient security. Do not assume every
doctor can access every patient record.

## 10. Interaction and Feedback States

Every interactive component must communicate its state.

Required states: - Default. - Hover. - Focus. - Active / selected. -
Disabled. - Loading. - Success. - Error.

After an action: - Show confirmation when it succeeds. - Explain what
failed and how to recover. - Prevent accidental duplicate submissions. -
Confirm destructive or irreversible actions. - Keep messages concise and
specific.

Avoid controls that look clickable but do nothing. If a feature is only
a prototype, identify it clearly as demo-only.

## 11. Responsive Behavior

The Hospital Web Portal is primarily a desktop web application, but it
should remain usable on smaller screens.

**Desktop** - Full Sidebar and Navbar. - Tables and operational
information remain easy to scan. - Page actions align with the title
area.

**Tablet** - Sidebar may collapse. - Metric cards reflow. - Filters may
wrap or move into a filter panel.

**Mobile browser** - Use compact navigation. - Stack content
vertically. - Prevent forms and tables from overflowing. - Keep critical
actions accessible.

Do not hide essential clinical or operational information solely to
preserve a desktop layout.

## 12. Accessibility and Usability

-   Maintain sufficient text and control contrast.
-   Provide keyboard navigation and visible focus indicators.
-   Use semantic headings and labels.
-   Provide accessible names for icon-only buttons.
-   Do not rely on color alone for status.
-   Use clear healthcare terminology.
-   Avoid unnecessary animation and visual distraction.
-   Keep error messages understandable and actionable.

## 13. Shared Components and Code Reuse

All developers must reuse the existing shared application shell and
components.

Suggested component organization (adapt to the current repository; do
not duplicate existing files):

``` text
frontend/hospital-portal/
├── app/
│   ├── login/
│   ├── forgot-password/
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── patients/
│       ├── registrations/
│       ├── appointments/
│       ├── queue/
│       ├── doctors/
│       ├── departments/
│       ├── documents/
│       ├── ai-review/
│       ├── tasks/
│       ├── reports/
│       └── settings/
└── components/
    ├── layout/
    │   ├── Sidebar
    │   ├── Navbar
    │   └── DashboardLayout
    ├── ui/
    └── shared/
```

Rules: - Build the Sidebar and Navbar once. - Use one authenticated
dashboard layout. - Reuse buttons, inputs, cards, tables, badges,
modals, and form patterns. - Keep shared design tokens centralized. -
Avoid duplicating components inside individual modules. - Coordinate
before changing shared components used by another developer.

## 14. Stitch and AI-Assisted Implementation

Google Stitch screens are the visual reference for page implementation.

For each page: 1. Review the approved Stitch screen. 2. Identify the
page structure and interactions. 3. Review `design-system.md` and this
document. 4. Reuse the shared layout and existing components. 5.
Implement using the current project conventions. 6. Compare the result
with the Stitch reference. 7. Test the route and interaction states. 8.
Commit the work to the assigned Git branch.

### Instructions for Claude and other AI coding assistants

Before generating code, inspect: - `project-overview.md` -
`design-system.md` - `ui-guidelines.md` - Existing project files and
package configuration. - Relevant Stitch screenshots or exported
designs. - Existing shared components.

AI coding assistants must: - Reuse the existing Navbar, Sidebar, and
dashboard layout. - Follow the established colors, typography, spacing,
and icon style. - Avoid creating duplicate routes or components. - Avoid
changing unrelated modules. - Avoid changing dependencies or project
configuration without a clear need. - Avoid inventing backend endpoints,
database fields, or integrations. - Identify mock data and demo-only
interactions clearly. - Summarize files changed and assumptions after
implementation.

## 15. Four-Day MVP Implementation Rules

Prioritize working core workflows and a consistent interface.

**Must demonstrate** - Authentication and dashboard access. - Patient
directory and patient details. - Patient registration requests. -
Appointment listing and details. - Queue overview and status. - Doctor
and department information. - Medical document listing and details. - AI
Review demonstration.

**Basic implementation is acceptable for** - Tasks. - Reports. - Staff
and facility settings.

**May be simplified or mocked** - Advanced analytics. - Real-time
notifications. - Advanced OCR. - Predictive queue management. - External
hospital integrations. - Production-grade AI processing.

Clearly distinguish mocked behavior from real functionality. Do not
present simulated clinical results as real medical assessments.

## 16. Definition of Done --- Per Page

A page is ready for review when: - It follows the approved Stitch
reference or documented design decision. - It uses the MedKnot Design
System. - It uses the shared Navbar, Sidebar, and layout where
appropriate. - Its route loads correctly. - Its controls work or are
clearly marked as demo-only. - Loading, empty, and error states are
considered. - Role-based access is respected. - It works at the intended
screen size. - No unrelated modules or shared components were
unintentionally changed. - The code has been tested and committed to the
correct branch.

------------------------------------------------------------------------

**End of UI Guidelines**\
**Primary references:** MedKnot CI Brand Board, supplied MedKnot Logo,
Staff Management reference screen, Account Verification reference
screen, approved Stitch designs, `project-overview.md`, and
`design-system.md`.
