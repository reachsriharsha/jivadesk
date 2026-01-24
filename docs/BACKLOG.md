# JivaDesk Feature Backlog

**Last Updated:** 2026-01-23
**Status:** Planning

---

## Overview

This document contains the complete feature backlog for JivaDesk, organized by implementation phase. Each feature will have a corresponding Feature Specification Document (FSD) created in the `docs/features/` folder.

---

## 🟢 MVP Features (Phase 1)

### 1. Authentication & Onboarding

| Feature ID | Feature Name             | Description                                                       | Status      |
| ---------- | ------------------------ | ----------------------------------------------------------------- | ----------- |
| AUTH-001   | Doctor Registration      | Register with email and phone number                              | 🎉 Deployed |
| AUTH-002   | Doctor Login             | Email + password login with JWT                                   | 🎉 Deployed |
| AUTH-003   | First-time Profile Setup | Capture name, medical registration, qualification, specialization | 🎉 Deployed |
| AUTH-004   | Password Reset           | Forgot password flow via email/phone                              | 📝 Planned  |
| AUTH-005   | Logout                   | User should be able to logout                                     | 📝 Planned  |

### 2. Patient Management

| Feature ID | Feature Name          | Description                                   | Status     |
| ---------- | --------------------- | --------------------------------------------- | ---------- |
| PAT-001    | Create Patient        | Add patient with name, age/DOB, gender, phone | 📝 Planned |
| PAT-002    | Search Patient        | Auto-search by phone number                   | 📝 Planned |
| PAT-003    | View Patient          | View patient details and profile              | 📝 Planned |
| PAT-004    | Edit Patient          | Update patient information                    | 📝 Planned |
| PAT-005    | Patient Visit History | View all past visits for a patient            | 📝 Planned |

### 3. OPD Visit & Consultation

| Feature ID | Feature Name       | Description                                  | Status     |
| ---------- | ------------------ | -------------------------------------------- | ---------- |
| VISIT-001  | Create Visit       | Start new visit with date, doctor, complaint | 📝 Planned |
| VISIT-002  | Record Symptoms    | Free text + template-based symptom entry     | 📝 Planned |
| VISIT-003  | Record Diagnosis   | Add diagnosis to visit                       | 📝 Planned |
| VISIT-004  | Clinical Notes     | Add notes (optional SOAP format)             | 📝 Planned |
| VISIT-005  | Set Follow-up      | Set follow-up date for the visit             | 📝 Planned |
| VISIT-006  | View Visit Details | View complete visit information              | 📝 Planned |

### 4. Digital Prescription

| Feature ID | Feature Name              | Description                        | Status     |
| ---------- | ------------------------- | ---------------------------------- | ---------- |
| RX-001     | Add Medicine              | Medicine name with autocomplete    | 📝 Planned |
| RX-002     | Set Dosage                | Dosage format (1-0-1, 0-1-1, etc.) | 📝 Planned |
| RX-003     | Set Duration              | Duration of medication             | 📝 Planned |
| RX-004     | Add Instructions          | Advice/instructions for medicines  | 📝 Planned |
| RX-005     | Generate Prescription PDF | Create printable PDF prescription  | 📝 Planned |
| RX-006     | Print Prescription        | Print prescription directly        | 📝 Planned |
| RX-007     | Share via WhatsApp        | Send prescription PDF via WhatsApp | 📝 Planned |

---

## 🟡 Phase 2 Features

### 5. User & Clinic Setup

| Feature ID | Feature Name               | Description                            | Status     |
| ---------- | -------------------------- | -------------------------------------- | ---------- |
| CLINIC-001 | Doctor Profile Management  | Edit doctor profile details            | 📝 Planned |
| CLINIC-002 | Clinic Details             | Add/edit clinic name, address, contact | 📝 Planned |
| CLINIC-003 | Upload Logo                | Upload clinic logo for prescriptions   | 📝 Planned |
| CLINIC-004 | Prescription Customization | Customize prescription format/template | 📝 Planned |

### 6. Appointment & Token System

| Feature ID | Feature Name             | Description                            | Status     |
| ---------- | ------------------------ | -------------------------------------- | ---------- |
| APT-001    | Walk-in Token Generation | Generate tokens for walk-in patients   | 📝 Planned |
| APT-002    | Time-based Appointments  | Schedule appointments with time slots  | 📝 Planned |
| APT-003    | Queue View               | Doctor-wise patient queue display      | 📝 Planned |
| APT-004    | Next Patient Dashboard   | "Call next" functionality              | 📝 Planned |
| APT-005    | Attach Documents         | Upload reports/scans to patient record | 📝 Planned |

### 7. Billing

| Feature ID | Feature Name      | Description                         | Status     |
| ---------- | ----------------- | ----------------------------------- | ---------- |
| BILL-001   | Create Bill       | Create bill for a visit             | 📝 Planned |
| BILL-002   | Consultation Fee  | Auto-add consultation fee           | 📝 Planned |
| BILL-003   | Add Line Items    | Add procedures, injections, etc.    | 📝 Planned |
| BILL-004   | Payment Recording | Record payment mode (cash/UPI/card) | 📝 Planned |
| BILL-005   | Generate Receipt  | Generate PDF receipt                | 📝 Planned |
| BILL-006   | Print Receipt     | Print payment receipt               | 📝 Planned |

---

## 🟡 Phase 3 Features

### 8. Inventory Management

| Feature ID | Feature Name        | Description                 | Status     |
| ---------- | ------------------- | --------------------------- | ---------- |
| INV-001    | Add Medicine Stock  | Add medicines to inventory  | 📝 Planned |
| INV-002    | Update Stock        | Update stock quantities     | 📝 Planned |
| INV-003    | Low Stock Alerts    | Notifications for low stock | 📝 Planned |
| INV-004    | Supplier Management | Manage supplier information | 📝 Planned |

### 9. Reports & Analytics

| Feature ID | Feature Name      | Description                    | Status     |
| ---------- | ----------------- | ------------------------------ | ---------- |
| RPT-001    | Daily OPD Report  | Daily patient count report     | 📝 Planned |
| RPT-002    | Revenue Summary   | Revenue reports by period      | 📝 Planned |
| RPT-003    | Patient Retention | Patient return visit analytics | 📝 Planned |
| RPT-004    | Disease Trends    | Basic disease trend analysis   | 📝 Planned |

### 10. Multi-user & Roles

| Feature ID | Feature Name          | Description                    | Status     |
| ---------- | --------------------- | ------------------------------ | ---------- |
| ROLE-001   | Add Staff Users       | Add receptionist, nurse, admin | 📝 Planned |
| ROLE-002   | Role Assignment       | Assign roles to users          | 📝 Planned |
| ROLE-003   | Permission Management | Role-based feature access      | 📝 Planned |

### 11. Notifications

| Feature ID | Feature Name          | Description                        | Status     |
| ---------- | --------------------- | ---------------------------------- | ---------- |
| NOTIF-001  | Appointment Reminders | SMS/WhatsApp appointment reminders | 📝 Planned |
| NOTIF-002  | Follow-up Reminders   | Automated follow-up notifications  | 📝 Planned |

---

## 🔵 Phase 4 Features (Future)

| Feature ID | Feature Name             | Description                           | Status     |
| ---------- | ------------------------ | ------------------------------------- | ---------- |
| FUT-001    | Voice-to-Text Notes      | Speech recognition for clinical notes | 📝 Planned |
| FUT-002    | Regional Languages       | Multi-language prescription support   | 📝 Planned |
| FUT-003    | AI Diagnosis Suggestions | AI-assisted diagnosis (compliant)     | 📝 Planned |
| FUT-004    | Lab Integration          | Integration with diagnostic labs      | 📝 Planned |
| FUT-005    | Teleconsultation         | Video consultation feature            | 📝 Planned |
| FUT-006    | Offline PWA              | Offline-first progressive web app     | 📝 Planned |

---

## 🔵 Logging & Diagnostics

| Feature ID | Feature Name             | Description                                                      | Status     |
| ---------- | ------------------------ | ---------------------------------------------------------------- | ---------- |
| FEAT-004   | Dynamic Log Level        | Allow runtime log level changes globally and per component/module | 📝 Planned |

- [Feature Spec: FEAT-004_dynamic_log_level.md](features/FEAT-004_dynamic_log_level.md)
- [Design Spec: DES-004_dynamic_log_level.md](design/DES-004_dynamic_log_level.md)

---

## Summary

| Phase         | Feature Count   | Status      |
| ------------- | --------------- | ----------- |
| MVP (Phase 1) | 17 features     | 📝 Planning |
| Phase 2       | 13 features     | 📝 Planning |
| Phase 3       | 11 features     | 📝 Planning |
| Phase 4       | 6 features      | 📝 Planning |
| **Total**     | **47 features** |             |

---

## Status Legend

| Status         | Icon | Description                          |
| -------------- | ---- | ------------------------------------ |
| Planned        | 📝   | Feature identified, spec not started |
| Spec Ready     | 📐   | Feature spec completed               |
| In Development | 🔨   | Currently being implemented          |
| In Testing     | 🧪   | Implementation complete, testing     |
| Deployed       | 🎉   | Released to production               |
| On Hold        | ⏸️   | Paused                               |

---

## Feature Spec Document Links

_Links will be added as feature specs are created_

### MVP (Phase 1)

- AUTH-001: [Doctor Registration](./features/AUTH-001_doctor_registration.md) ✅
- AUTH-002: [Doctor Login](./features/AUTH-002_doctor_login.md) ✅
- AUTH-003: [First-time Profile Setup](./features/AUTH-003_profile_setup.md) ✅
- AUTH-004: [Pending]
- PAT-001: [Pending]
- PAT-002: [Pending]
- PAT-003: [Pending]
- PAT-004: [Pending]
- PAT-005: [Pending]
- VISIT-001: [Pending]
- VISIT-002: [Pending]
- VISIT-003: [Pending]
- VISIT-004: [Pending]
- VISIT-005: [Pending]
- VISIT-006: [Pending]
- RX-001: [Pending]
- RX-002: [Pending]
- RX-003: [Pending]
- RX-004: [Pending]
- RX-005: [Pending]
- RX-006: [Pending]
- RX-007: [Pending]

---

**End of Feature Backlog**
