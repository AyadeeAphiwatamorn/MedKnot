## Project Demonstration

📹 [Watch the MedKnot Project Demo](https://drive.google.com/drive/folders/1qN5NOp4pGUY4CRbfRKs-IC9i-PSRSCoZ?usp=sharing)

The folder contains the project demonstration video and supporting materials.
# MedKnot
### AI Smart Healthcare Triage & Care Management Platform

**MedKnot** is an AI-assisted, multi-facility healthcare platform designed to connect patients with participating hospitals and clinics. It aims to make healthcare services more accessible, organized, and efficient by combining patient services, hospital management, appointment scheduling, queue management, medical records, and AI-assisted healthcare workflows.

This project is being developed as a **Final Year Project prototype**, with an initial research focus on selected hospitals and clinics around Yelachenahalli–Vajarahalli, Kanakapura Road, Bengaluru, India.

---

## 1. Project Overview

MedKnot consists of two main interfaces:

- **Patient Mobile Application:** Allows patients to discover healthcare facilities, register, request appointments, track appointment and queue status, upload medical documents, and access their medical history.
- **Hospital and Clinic Management Dashboard:** Allows authorized hospital staff to manage patient registrations, doctors, appointments, queues, medical documents, consultation information, and administrative tasks.

Both interfaces are connected through a shared backend system with role-based access and facility-level permissions.

## 2. Problem Statement

Patients often face difficulties during healthcare visits, including repetitive paperwork, disconnected medical records, unclear appointment statuses, long waiting periods, and difficulty understanding medical reports.

Hospital staff also spend considerable time on repetitive administrative tasks such as patient registration, document processing, appointment coordination, and preparing patient information before consultations.

MedKnot aims to address these challenges through a connected healthcare platform that combines patient management, facility operations, and supervised AI-assisted tools.

## 3. Project Objectives

- Connect patients with participating hospitals and clinics.
- Simplify patient registration and appointment management.
- Provide appointment status and queue updates.
- Maintain organized patient medical and treatment history.
- Reduce repetitive data entry through AI-assisted document processing.
- Generate pre-consultation summaries for healthcare professionals.
- Help patients understand medical terminology through simple explanations.
- Improve accessibility for older adults and people with limited digital literacy.
- Reduce administrative workload and improve healthcare workflow efficiency.

## 4. Main Features

### Patient Mobile Application

- Patient registration and login.
- Hospital and clinic discovery.
- Facility information and services.
- Facility-specific patient registration.
- Doctor and specialty discovery.
- Appointment booking and management.
- Appointment confirmation and status tracking.
- Queue status and estimated waiting time.
- Medical document upload and access.
- Patient medical history and health timeline.
- Treatment and medication history.
- Follow-up reminders and notifications.
- AI-assisted medical report explanations.
- Guided patient intake and accessible navigation.

### Hospital and Clinic Management Dashboard

- Secure staff login and role-based access.
- Hospital and clinic profile management.
- Doctor and specialty management.
- Patient registration management.
- Appointment request review and approval.
- Doctor and appointment slot assignment.
- Queue and patient visit management.
- Medical document management.
- AI-extracted information review and correction.
- AI-generated pre-consultation summaries.
- Staff task management.
- Missing document notifications.
- Follow-up management.
- Basic operational analytics.

## 5. AI-Powered Features

AI is integrated into MedKnot to support administrative and information-processing tasks.

**1. AI Medical Document Processing**
- Extract text from scanned medical reports using OCR.
- Identify and organize document information.
- Convert extracted information into structured data.
- Allow authorized staff to review and correct extracted information.

**2. AI Pre-Consultation Summary**
- Summarize relevant patient medical history.
- Organize previous consultation information.
- Highlight relevant medical documents and available test results.
- Prepare a draft summary for doctors to review.

**3. AI Medical Report Explainer**
- Explain medical terminology in simple language.
- Help patients understand what medical tests generally measure.
- Explain information contained in uploaded reports.
- Suggest questions patients can discuss with healthcare professionals.

**4. AI-Assisted Patient Registration**
- Assist patients in completing registration forms.
- Support guided intake and voice-to-text where available.
- Identify missing or unclear information.
- Prepare draft forms based on actual patient responses.

**5. AI Administrative Workflow Assistant**
- Identify incomplete registration forms.
- Flag missing documents.
- Organize pending staff tasks.
- Prepare appointment reminders and follow-up messages.

> **Important:** MedKnot is not designed to independently diagnose patients or prescribe treatments. AI-generated medical information remains a draft and requires appropriate human review.

## 6. Implementation Modules

The project is organized into eight main implementation modules.

| Module | Name |
|---|---|
| M1 | Platform Foundation, Users, Roles & Facilities |
| M2 | Facility Discovery & Facility Registration |
| M3 | Doctors, Availability & Appointment Management |
| M4 | Queue & Visit Workflow |
| M5 | Medical Documents & Patient Health Timeline |
| M6 | AI Document Processing & Pre-Consultation Summary |
| M7 | Patient Accessibility, Report Explanation & Guided Intake |
| M8 | Staff Workflow, Notifications, Analytics & Evaluation |

## 7. Proposed Technology Stack

| Area | Technology |
|---|---|
| Patient Mobile Application | React Native, Expo, TypeScript |
| Hospital Management Dashboard | React, TypeScript, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| Authentication & Storage | Supabase Auth & Storage |
| UI/UX Design | Figma |
| OCR | Google Cloud Vision OCR |
| AI Integration | LLM API |
| API Testing | Postman |
| Version Control | Git & GitHub |

*Note: This is the proposed technology stack for the prototype. Actual implementation technologies may vary.*

## 8. System Architecture

MedKnot uses a shared backend architecture connecting the patient mobile application and hospital management dashboard.

```text
       Patient Mobile Application
          (React Native + Expo)
                    |
                    v
              Backend API
          (Node.js + Express)
                    |
          +---------+---------+
          |         |         |
          v         v         v
      Database   File      AI Services
    (PostgreSQL) Storage    (OCR + LLM)
          |         |         |
          +---------+---------+
                    |
                    v
       Hospital Management Dashboard
             (React + TypeScript)
```

All protected medical information must be accessed through backend authorization checks to maintain patient privacy and facility-level data separation.

## 9. Project Demonstration

A recorded project demonstration is available through the Google Drive folder below.

**Google Drive – Project Demonstration Video:**

[Click here to view the MedKnot demonstration](PASTE_YOUR_GOOGLE_DRIVE_FOLDER_LINK_HERE)

The folder contains the project walkthrough video and supporting demonstration materials.

## 10. Prototype Scope

The initial prototype focuses on demonstrating a complete patient-to-facility workflow:

1. Patient registration and login.
2. Healthcare facility discovery.
3. Facility-specific patient registration.
4. Appointment requests and confirmation.
5. Doctor and specialty management.
6. Patient queue status.
7. Medical document upload.
8. OCR-based document extraction.
9. Staff review and correction of extracted information.
10. AI-generated pre-consultation summaries.
11. Patient medical history and health timeline.

Advanced predictive queue models, extensive hospital integrations, payment systems, and autonomous clinical decision-making are outside the initial prototype scope.

## 11. Privacy and Security

Since MedKnot handles healthcare-related information, privacy and security are important design considerations.

- Role-based access control.
- Facility-level data separation.
- Secure authentication.
- Authorized access to medical documents.
- Preservation of original uploaded documents.
- Human review of AI-generated medical information.
- Audit logs for important activities.
- Use of synthetic or appropriately authorized test data during prototype development.

## 12. Future Enhancements

Potential future improvements include:

- Additional regional language support.
- Voice-assisted patient registration.
- Advanced queue estimation.
- Improved AI medical document processing.
- Expanded hospital integration.
- Enhanced patient notifications.
- More advanced healthcare analytics.
- Usability improvements based on patient and staff feedback.

---

## Project Information

| Detail | Information |
|---|---|
| Application Name | MedKnot |
| Project Title | AI Smart Healthcare Triage & Care Management Platform |
| Project Type | Final Year Project |
| Project Stage | Prototype Development |
| Target Area | Bengaluru, Karnataka, India |
| Main Interfaces | Patient Mobile App & Hospital Management Dashboard |

---

**MedKnot — Connecting Patients, Healthcare Facilities, and Care Information.**
