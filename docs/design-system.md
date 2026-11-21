# MedKnot --- Design System

**Document:** `design-system.md`\
**Product:** MedKnot --- AI Smart Healthcare Triage & Care Management
Platform\
**Applies to:** Patient Mobile Application and Hospital Web Portal\
**Status:** Initial brand and UI foundation\
**Primary reference:** MedKnot CI Brand Board and MedKnot Logo supplied
by the project team

------------------------------------------------------------------------

## 1. Purpose

This document defines the shared visual language of MedKnot. It is the
source of truth for brand colors, typography, logo usage, icon style,
visual hierarchy, and reusable interface components.

All team members and AI coding assistants must follow this document when
creating or modifying MedKnot interfaces. Do not introduce a new brand
palette, font family, or visual direction without team approval.

## 2. Brand Identity

### 2.1 Brand name

**MedKnot**

### 2.2 Tagline

**Connected care. Brighter lives.**

### 2.3 Brand idea

The MedKnot symbol represents four connected ideas shown in the CI
concept:

-   **People:** Patients, doctors, clinics, and hospitals.
-   **Care:** Continuous support across every stage.
-   **Connection:** A seamless knot that brings everyone together.
-   **Growth:** Brighter and healthier lives.

The interwoven symbol communicates connection and continuity. Use it
consistently across the patient application, hospital portal, documents,
and supporting brand materials.

### 2.4 Brand personality

MedKnot should feel:

-   Trustworthy and professional.
-   Approachable and reassuring.
-   Modern and technology-enabled.
-   Clear, calm, and easy to use.
-   Connected and supportive.

Avoid visual treatments that feel overly clinical, intimidating,
playful, or unnecessarily complex.

## 3. Logo System

The supplied CI board shows the primary MedKnot wordmark, a standalone
application symbol, and the logo concept.

### 3.1 Approved logo assets

Use the supplied project assets as the source of truth:

-   Full MedKnot wordmark: symbol + "MedKnot" + tagline.
-   Standalone MedKnot symbol: use for app icon, favicon, compact
    navigation, and small brand placements.
-   Application icon presentation: symbol centered within a
    rounded-square container, where appropriate.

Store approved assets in the shared repository, for example:

``` text
frontend/hospital-portal/public/brand/
├── medknot-logo.png
├── medknot-symbol.png
└── README.md
```

Use the actual approved filenames selected by the team. Do not rename or
duplicate assets unnecessarily.

### 3.2 Logo usage

-   Preserve the logo's original proportions.
-   Keep clear space around the logo.
-   Use the full wordmark when there is enough horizontal space.
-   Use the standalone symbol in compact areas.
-   Prefer the supplied light-background logo treatment on light
    surfaces.
-   Use a suitable approved variant if a dark background requires one.
-   Keep the logo sharp; do not stretch, skew, recolor, crop, or add
    effects.
-   Do not recreate the logo using text, CSS shapes, or AI-generated
    approximations.

### 3.3 Logo backgrounds

Preferred backgrounds are Soft White or other approved light surfaces.
Ensure sufficient contrast and avoid placing the logo over busy imagery.

## 4. Color System

The following values are taken from the supplied MedKnot CI Brand Board.

  -----------------------------------------------------------------------
  Color name              Hex                     Primary use
  ----------------------- ----------------------- -----------------------
  Fresh Blue              `#015CA9`               Primary brand color,
                                                  primary actions, active
                                                  navigation, links

  Creamy Avocado          `#DFEEA9`               Soft brand highlight,
                                                  selected states,
                                                  supportive accents

  Light Blue              `#E1F2FD`               Secondary surfaces,
                                                  information panels,
                                                  subtle backgrounds

  Soft White              `#F8FAF6`               Main application
                                                  background and light
                                                  surfaces

  Sage Green              `#A3C8B4`               Supportive accents,
                                                  positive or calm visual
                                                  emphasis

  Soft Yellow             `#FAE193`               Gentle highlights,
                                                  attention cues,
                                                  selected decorative
                                                  accents
  -----------------------------------------------------------------------

### 4.1 Color roles

**Fresh Blue --- Primary** - Use for primary buttons and key actions. -
Use for active navigation indicators and important links. - Use for
headings or icons when a strong brand accent is needed. - Avoid using it
as a large page background if it reduces readability.

**Creamy Avocado --- Brand highlight** - Use for soft selected states,
chips, subtle highlights, and decorative brand accents. - Do not use as
the only indicator of status.

**Light Blue --- Secondary surface** - Use for information panels,
secondary cards, filters, and low-emphasis sections. - Pair with dark
text for readable contrast.

**Soft White --- Base** - Use as the default page background and for
clean content areas. - Use white or near-white surfaces to create
separation between sections.

**Sage Green --- Supportive accent** - Use sparingly for supportive or
positive emphasis. - Do not assume it always means "success"; pair
status colors with text labels.

**Soft Yellow --- Attention accent** - Use for gentle highlights and
non-critical attention cues. - Do not use it as the only visual warning
indicator.

### 4.2 Suggested semantic colors

The CI board defines the six brand colors above. It does not specify a
complete semantic status palette. For functional states, use the
following as provisional UI tokens and validate them for contrast before
release:

  Semantic role   Suggested token   Usage
  --------------- ----------------- ----------------------------------------------
  Success         `#287A55`         Completed or successful actions
  Warning         `#946200`         Needs attention or pending action
  Error           `#B42318`         Errors, failed actions, destructive warnings
  Information     `#015CA9`         Neutral information and guidance
  Neutral text    `#536273`         Secondary text and metadata
  Main text       `#17324D`         Primary body text and headings
  Border          `#DCE5E8`         Dividers, outlines, and input borders

These semantic colors are interface recommendations, not additional
official CI brand colors. Keep them centralized as tokens so they can be
reviewed consistently.

### 4.3 Color usage principles

-   Use Fresh Blue for the most important action on a screen.
-   Keep large backgrounds light and calm.
-   Use accent colors in moderation.
-   Do not use multiple competing accent colors in one component.
-   Always pair color-coded status with a text label or icon.
-   Check text and control contrast, especially on Creamy Avocado, Light
    Blue, Sage Green, and Soft Yellow.

## 5. Typography

The CI Brand Board specifies **Inter** as the typeface.

### 5.1 Font family

``` css
font-family: "Inter", sans-serif;
```

Use Inter consistently across the Hospital Web Portal and Patient Mobile
Application unless a platform-specific requirement is approved.

### 5.2 Typography hierarchy

Suggested starting scale for the web portal:

  -------------------------------------------------------------------------
  Style                 Suggested size               Weight Usage
  --------------- -------------------- -------------------- ---------------
  Page title                  28--32px                  700 Main page
                                                            heading

  Section heading             20--24px                  600 Major content
                                                            sections

  Card heading                16--18px                  600 Card and panel
                                                            titles

  Body                        14--16px                  400 Main interface
                                                            text

  Supporting text             12--14px                  400 Descriptions
                                                            and metadata

  Label                       12--14px             500--600 Form labels and
                                                            table headings

  Small helper      12px minimum where                  400 Hints and
  text                       practical                      secondary
                                                            information
  -------------------------------------------------------------------------

These are implementation defaults. Adjust carefully for responsive
layouts and accessibility.

### 5.3 Typography rules

-   Use sentence case for page titles, buttons, labels, and navigation.
-   Keep headings concise and descriptive.
-   Use weight and spacing to establish hierarchy rather than excessive
    font-size changes.
-   Avoid long passages in all caps.
-   Keep line height comfortable and body text readable.

## 6. Iconography

The CI board uses simple outlined healthcare and service icons.

### 6.1 Icon characteristics

-   Prefer clean, outlined icons.
-   Use consistent stroke weight and visual size.
-   Use Fresh Blue or a dark blue tone for icon strokes.
-   Use pale brand colors for small icon backgrounds or supporting
    fills.
-   Keep icons simple and immediately recognizable.

### 6.2 Icon subjects shown in the CI board

Examples include: - Appointments / calendar. - Doctors / stethoscope. -
Hospitals / medical building. - Patients / people. - Health records /
document. - Chat / conversation. - Find care / location. - Insurance /
shield.

Use one consistent icon library throughout the application. Do not mix
filled, outlined, and illustrated icon families without a deliberate
system.

## 7. Shape, Spacing, and Elevation

The CI board establishes a soft, rounded, clean visual direction. The
following are recommended UI defaults to keep implementation consistent.

### 7.1 Corner radius

  -----------------------------------------------------------------------
  Element                                                Suggested radius
  ------------------------------ ----------------------------------------
  Small controls / badges                                          6--8px

  Inputs / buttons                                                8--10px

  Cards / panels                                                 12--16px

  Modal / large containers                                       16--20px

  App icon container               Follow supplied logo asset or platform
                                                               convention
  -----------------------------------------------------------------------

### 7.2 Spacing scale

Use a consistent 4px-based spacing scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`

Prefer spacing tokens rather than arbitrary one-off values.

### 7.3 Borders and shadows

-   Prefer subtle borders for separating cards and sections.
-   Use soft, low-opacity shadows only when elevation helps explain
    hierarchy.
-   Avoid heavy shadows, thick outlines, and excessive glass effects.
-   Use clear focus indicators for keyboard interaction.

## 8. Component Visual Principles

All shared components should follow the same tokens.

### Buttons

-   Primary: Fresh Blue background with white text.
-   Secondary: Light surface with Fresh Blue text and a subtle border.
-   Tertiary / text: Minimal treatment for low-emphasis actions.
-   Destructive: Use the semantic error token and a clear action label.
-   Provide hover, focus, active, disabled, and loading states.

### Cards

-   Use Soft White or white surfaces.
-   Use consistent padding and radius.
-   Keep card headings and supporting text clearly separated.
-   Avoid unnecessary decorative gradients.

### Inputs

-   Use readable labels and clear placeholders.
-   Provide visible focus, error, disabled, and read-only states.
-   Do not rely on placeholder text as the only label.

### Status badges

-   Use concise text labels.
-   Use semantic colors consistently.
-   Never communicate status by color alone.

### Tables

-   Use clear column headings and row spacing.
-   Keep actions predictable and aligned.
-   Support loading, empty, and error states.

## 9. Accessibility and Contrast

-   Maintain readable text contrast against every surface.
-   Provide keyboard-visible focus states.
-   Use labels for form controls.
-   Provide meaningful accessible names for icon-only buttons.
-   Do not rely only on color to communicate status.
-   Support zoom and responsive layouts without hiding essential
    actions.
-   Use appropriate alternative text for meaningful images and logos.

## 10. Design Tokens --- Starter CSS

The following tokens can be used as the initial shared CSS foundation:

``` css
:root {
  /* Official MedKnot CI colors */
  --color-primary: #015CA9;
  --color-creamy-avocado: #DFEEA9;
  --color-light-blue: #E1F2FD;
  --color-soft-white: #F8FAF6;
  --color-sage-green: #A3C8B4;
  --color-soft-yellow: #FAE193;

  /* Provisional semantic UI colors */
  --color-success: #287A55;
  --color-warning: #946200;
  --color-error: #B42318;
  --color-info: #015CA9;

  /* Text and borders */
  --color-text-primary: #17324D;
  --color-text-secondary: #536273;
  --color-border: #DCE5E8;

  /* Typography */
  --font-family-base: "Inter", sans-serif;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

## 11. Rules for Developers and AI Coding Assistants

1.  Treat this file and the approved CI assets as the source of truth
    for MedKnot's visual identity.
2.  Reuse the existing tokens and shared components.
3.  Do not introduce another primary color or font.
4.  Do not recreate or alter the supplied logo.
5.  Keep spacing, radii, typography, and icon style consistent.
6.  If a required token is missing, propose it and get team approval
    before adding it.
7.  Review all new screens against the CI Brand Board before merging.

------------------------------------------------------------------------

**End of Design System**\
**Brand reference:** MedKnot CI Brand Board and supplied MedKnot Logo.
