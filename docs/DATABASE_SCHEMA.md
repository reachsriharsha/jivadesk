# JivaDesk Database Schema

## Overview

PostgreSQL 15 with shared-table multi-tenancy using `clinic_id`.

---

## ER Diagram (Text)

```
┌──────────────┐       ┌──────────────┐
│   clinics    │       │   medicines  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │
│ address      │       │ generic_name │
│ phone        │       │ category     │
│ created_at   │       │ form         │
└──────┬───────┘       └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ clinic_id(FK)│◄──────────────────────────┐
│ email        │                           │
│ password_hash│                           │
│ name         │                           │
│ phone        │                           │
│ medical_reg  │                           │
│ is_profile_complete                      │
│ created_at   │                           │
└──────┬───────┘                           │
       │                                   │
       │ 1:N                               │
       ▼                                   │
┌──────────────┐                           │
│   patients   │                           │
├──────────────┤                           │
│ id (PK)      │                           │
│ clinic_id(FK)│◄──────────────────────────┤
│ name         │                           │
│ phone        │                           │
│ dob          │                           │
│ gender       │                           │
│ address      │                           │
│ created_at   │                           │
└──────┬───────┘                           │
       │                                   │
       │ 1:N                               │
       ▼                                   │
┌──────────────┐                           │
│    visits    │                           │
├──────────────┤                           │
│ id (PK)      │                           │
│ clinic_id(FK)│◄──────────────────────────┤
│ patient_id   │                           │
│ doctor_id    │                           │
│ visit_date   │                           │
│ symptoms     │                           │
│ diagnosis    │                           │
│ notes        │                           │
│ follow_up    │                           │
│ created_at   │                           │
└──────┬───────┘                           │
       │                                   │
       │ 1:1                               │
       ▼                                   │
┌──────────────────┐                       │
│  prescriptions   │                       │
├──────────────────┤                       │
│ id (PK)          │                       │
│ clinic_id (FK)   │◄──────────────────────┘
│ visit_id (FK)    │
│ advice           │
│ created_at       │
└──────┬───────────┘
       │
       │ 1:N
       ▼
┌──────────────────────┐
│  prescription_items  │
├──────────────────────┤
│ id (PK)              │
│ prescription_id (FK) │
│ medicine_name        │
│ dosage               │
│ duration             │
│ instructions         │
│ quantity             │
└──────────────────────┘
```

---

## Table Definitions

### clinics

Primary tenant/clinic entity.

| Column     | Type         | Constraints      | Description              |
| ---------- | ------------ | ---------------- | ------------------------ |
| id         | UUID         | PK, DEFAULT uuid | Unique clinic identifier |
| name       | VARCHAR(255) | NOT NULL         | Clinic name              |
| address    | TEXT         |                  | Full address             |
| phone      | VARCHAR(15)  |                  | Contact number           |
| logo_url   | VARCHAR(500) |                  | Logo image URL           |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Record creation time     |
| updated_at | TIMESTAMP    | DEFAULT NOW()    | Last update time         |

---

### users

Doctors who use the system. One clinic can have multiple doctors.

| Column              | Type         | Constraints      | Description                  |
| ------------------- | ------------ | ---------------- | ---------------------------- |
| id                  | UUID         | PK, DEFAULT uuid | Unique user identifier       |
| clinic_id           | UUID         | FK → clinics     | Associated clinic            |
| email               | VARCHAR(255) | UNIQUE, NOT NULL | Login email                  |
| password_hash       | VARCHAR(255) | NOT NULL         | Bcrypt hashed password       |
| name                | VARCHAR(255) |                  | Doctor's full name           |
| phone               | VARCHAR(15)  |                  | Phone number                 |
| medical_reg_number  | VARCHAR(100) |                  | Medical council reg number   |
| qualification       | VARCHAR(255) |                  | Degrees (MBBS, MD, etc.)     |
| specialization      | VARCHAR(255) |                  | Specialty                    |
| is_profile_complete | BOOLEAN      | DEFAULT FALSE    | First login wizard completed |
| is_active           | BOOLEAN      | DEFAULT TRUE     | Account active status        |
| created_at          | TIMESTAMP    | DEFAULT NOW()    | Record creation time         |
| updated_at          | TIMESTAMP    | DEFAULT NOW()    | Last update time             |

**Indexes:**

- `idx_users_email` on `email`
- `idx_users_clinic_id` on `clinic_id`

---

### patients

Patient records, scoped to clinic.

| Column      | Type         | Constraints      | Description            |
| ----------- | ------------ | ---------------- | ---------------------- |
| id          | UUID         | PK, DEFAULT uuid | Unique patient ID      |
| clinic_id   | UUID         | FK → clinics     | Associated clinic      |
| name        | VARCHAR(255) | NOT NULL         | Patient full name      |
| phone       | VARCHAR(15)  | NOT NULL         | Mobile number          |
| dob         | DATE         |                  | Date of birth          |
| age         | INT          |                  | Age (if DOB not known) |
| gender      | VARCHAR(10)  |                  | M / F / Other          |
| address     | TEXT         |                  | Patient address        |
| blood_group | VARCHAR(5)   |                  | Blood group            |
| notes       | TEXT         |                  | Any patient notes      |
| created_at  | TIMESTAMP    | DEFAULT NOW()    | Record creation time   |
| updated_at  | TIMESTAMP    | DEFAULT NOW()    | Last update time       |

**Indexes:**

- `idx_patients_clinic_phone` on `(clinic_id, phone)`
- `idx_patients_clinic_name` on `(clinic_id, name)`

**Constraints:**

- UNIQUE on `(clinic_id, phone)` - same phone can exist in different clinics

---

### visits

OPD consultation records.

| Column         | Type        | Constraints         | Description          |
| -------------- | ----------- | ------------------- | -------------------- |
| id             | UUID        | PK, DEFAULT uuid    | Unique visit ID      |
| clinic_id      | UUID        | FK → clinics        | Associated clinic    |
| patient_id     | UUID        | FK → patients       | Patient being seen   |
| doctor_id      | UUID        | FK → users          | Consulting doctor    |
| visit_date     | DATE        | NOT NULL            | Date of visit        |
| visit_time     | TIME        |                     | Time of visit        |
| symptoms       | TEXT        |                     | Chief complaints     |
| diagnosis      | TEXT        |                     | Doctor's diagnosis   |
| notes          | TEXT        |                     | Clinical notes       |
| follow_up_date | DATE        |                     | Next appointment     |
| status         | VARCHAR(20) | DEFAULT 'completed' | Visit status         |
| created_at     | TIMESTAMP   | DEFAULT NOW()       | Record creation time |
| updated_at     | TIMESTAMP   | DEFAULT NOW()       | Last update time     |

**Indexes:**

- `idx_visits_clinic_patient` on `(clinic_id, patient_id)`
- `idx_visits_clinic_date` on `(clinic_id, visit_date)`
- `idx_visits_doctor` on `doctor_id`

---

### prescriptions

Prescription header, linked to visit.

| Column     | Type      | Constraints         | Description                 |
| ---------- | --------- | ------------------- | --------------------------- |
| id         | UUID      | PK, DEFAULT uuid    | Unique prescription ID      |
| clinic_id  | UUID      | FK → clinics        | Associated clinic           |
| visit_id   | UUID      | FK → visits, UNIQUE | One prescription per visit  |
| advice     | TEXT      |                     | General advice/instructions |
| created_at | TIMESTAMP | DEFAULT NOW()       | Record creation time        |
| updated_at | TIMESTAMP | DEFAULT NOW()       | Last update time            |

**Indexes:**

- `idx_prescriptions_visit` on `visit_id`

---

### prescription_items

Individual medicines in a prescription.

| Column          | Type         | Constraints        | Description          |
| --------------- | ------------ | ------------------ | -------------------- |
| id              | UUID         | PK, DEFAULT uuid   | Unique item ID       |
| prescription_id | UUID         | FK → prescriptions | Parent prescription  |
| medicine_name   | VARCHAR(255) | NOT NULL           | Medicine name        |
| dosage          | VARCHAR(50)  |                    | e.g., "1-0-1"        |
| duration        | VARCHAR(50)  |                    | e.g., "5 days"       |
| instructions    | VARCHAR(255) |                    | e.g., "After food"   |
| quantity        | VARCHAR(50)  |                    | e.g., "10 tablets"   |
| sort_order      | INT          | DEFAULT 0          | Display order        |
| created_at      | TIMESTAMP    | DEFAULT NOW()      | Record creation time |

**Indexes:**

- `idx_prescription_items_prescription` on `prescription_id`

---

### medicines

Master list of medicines (seeded, shared across all clinics).

| Column       | Type         | Constraints      | Description               |
| ------------ | ------------ | ---------------- | ------------------------- |
| id           | UUID         | PK, DEFAULT uuid | Unique medicine ID        |
| name         | VARCHAR(255) | NOT NULL, UNIQUE | Brand/trade name          |
| generic_name | VARCHAR(255) |                  | Generic/salt name         |
| category     | VARCHAR(100) |                  | e.g., Antibiotic, Antacid |
| form         | VARCHAR(50)  |                  | Tablet, Syrup, Injection  |
| strength     | VARCHAR(50)  |                  | e.g., 500mg               |
| manufacturer | VARCHAR(255) |                  | Company name              |
| is_active    | BOOLEAN      | DEFAULT TRUE     | Available for selection   |
| created_at   | TIMESTAMP    | DEFAULT NOW()    | Record creation time      |

**Indexes:**

- `idx_medicines_name` on `name` (for search)
- `idx_medicines_generic` on `generic_name`

---

## Row-Level Security Pattern

All queries must include `clinic_id` filter:

```sql
-- Example: Get patients for a clinic
SELECT * FROM patients
WHERE clinic_id = :current_clinic_id;

-- Example: Create visit
INSERT INTO visits (clinic_id, patient_id, ...)
VALUES (:current_clinic_id, :patient_id, ...);
```

The `clinic_id` is extracted from JWT token in the backend.

---

## Seed Data Requirements

### medicines table

- ~500 common medicines used in Indian OPDs
- Categories: Antibiotics, Analgesics, Antacids, Vitamins, etc.
- Common brands + generics

Example seed data:

```json
[
  {
    "name": "Paracetamol 500mg",
    "generic_name": "Paracetamol",
    "category": "Analgesic",
    "form": "Tablet"
  },
  {
    "name": "Azithromycin 500mg",
    "generic_name": "Azithromycin",
    "category": "Antibiotic",
    "form": "Tablet"
  },
  {
    "name": "Omeprazole 20mg",
    "generic_name": "Omeprazole",
    "category": "Antacid",
    "form": "Capsule"
  }
]
```

---

## Migration Strategy

Using **Alembic** for migrations:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```
