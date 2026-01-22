A **SaaS for independent doctors & small outpatient clinics** in India.

1. **Target users & principles**
2. **Core feature set (MVP → Phase-2 → Phase-3)**
3. **End-to-end clinic workflows (real OPD flow)**
4. **System architecture (FastAPI + React + Bun)**
5. **Key data models**
6. **API & frontend flow examples**
7. **Monetization & India-specific considerations**

---

## 1. Target users & design principles

### Target users

- Single-doctor clinics
- 2–5 doctor practices
- Diagnostic-attached OPDs
- Specialists (physician, pediatrician, ENT, ortho, etc.)

### Design principles

- **Zero training needed**
- **Keyboard-first, fast UI**
- **Works with low internet**
- **Mobile + desktop friendly**
- **Offline-tolerant (Phase-2)**
- **India-first** (prescriptions, GST, languages)

---

## 2. Feature Set

### 🟢 MVP (Must-have to launch)

These features allow **actual daily clinic usage**.

#### 1. Doctor log in

- Register with email and phone number
- First log in should ask for Name, Address, Medical Number etc

#### 2. Patient Management

- Create patient (name, age/DOB, gender, phone)
- Auto-search by phone number
- Patient visit history

#### 3. OPD Visit & Consultation

- Create visit (date, doctor, complaint)
- Symptoms (free text + templates)
- Diagnosis
- Notes (SOAP optional)
- Follow-up date

#### 4. Digital Prescription

- Medicine name (autocomplete)
- Dosage (1-0-1, 0-1-1 etc.)
- Duration
- Advice / instructions
- Print + WhatsApp PDF

---

### 🟡 Phase-2 (Additional features)

#### 5. User & Clinic Setup

- Doctor profile
- Clinic details
- Logo, address
- Prescription format customization

#### 6. Appointment & Token System

- Walk-in tokens
- Attach documents (reports, scans)
- Time-based appointments
- Doctor-wise queue view
- “Next patient” dashboard

#### 7. Billing (Simple)

- Consultation fee
- Line items (procedure, injection)
- Payment mode (cash/UPI/card)
- Receipt (PDF)

### 🟡 Phase-3 (Retention & Scale)

#### 8. Inventory (Optional for clinics)

- Medicine stock
- Low-stock alerts
- Supplier info

#### 9. Reports & Analytics

- Daily OPD count
- Revenue summary
- Patient retention
- Disease trends (basic)

#### 10. Multi-user Roles

- Doctor
- Receptionist
- Nurse
- Admin

#### 11. Notifications

- Appointment reminders (SMS/WhatsApp)
- Follow-up reminders

---

### 🔵 Phase-4 (Differentiators)

- Voice-to-text clinical notes
- Regional language prescriptions
- AI-assisted diagnosis suggestions (careful & compliant)
- Integration with labs
- Teleconsultation
- Offline-first PWA

---

## 3. Real OPD Workflow (End-to-End)

This is **critical**—software must follow this flow.

### 1️⃣ Patient arrives

Receptionist:

```
Search patient by phone
→ If new: create patient
→ Generate token
→ Assign doctor
```

### 2️⃣ Doctor consultation

Doctor sees:

```
Queue → Click patient
→ View history
→ Add symptoms & diagnosis
→ Prescribe medicines
→ Set follow-up
```

### 3️⃣ Prescription

System:

```
Generate PDF
→ Print OR send WhatsApp
```

### 4️⃣ Billing

Receptionist:

```
Consultation fee auto-added
→ Add procedures
→ Payment
→ Receipt
```

### 5️⃣ Follow-up

System:

```
Store follow-up date
→ Trigger reminder later
```

---

## 4. System Architecture

### High-level architecture

```
React (Bun)
│
├── API Gateway (FastAPI)
│
├── Auth Service
├── Patient Service
├── Visit & Prescription Service
├── Billing Service
├── Notification Service
│
└── PostgreSQL
```

---

### Tech stack (Recommended)

| Layer      | Choice                 |
| ---------- | ---------------------- |
| Backend    | FastAPI                |
| Frontend   | React + Bun            |
| DB         | PostgreSQL             |
| ORM        | SQLAlchemy / SQLModel  |
| Auth       | JWT + RBAC             |
| PDF        | WeasyPrint / ReportLab |
| Storage    | S3-compatible (MinIO)  |
| Cache      | Redis                  |
| Deployment | Docker + DigitalOcean  |

---

## 5. Core Data Models (Simplified)

### Patient

```python
class Patient:
    id
    name
    phone
    dob
    gender
    address
```

### Visit

```python
class Visit:
    id
    patient_id
    doctor_id
    visit_date
    symptoms
    diagnosis
    notes
    follow_up_date
```

### Prescription

```python
class Prescription:
    id
    visit_id
    medicines: List[MedicineItem]
    advice
```

### MedicineItem

```python
class MedicineItem:
    name
    dosage
    duration
    instructions
```

### Bill

```python
class Bill:
    id
    visit_id
    total_amount
    payment_mode
    status
```

---

## 6. API & Frontend Flow Example

### Create OPD visit (FastAPI)

```python
POST /api/visits
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "complaint": "Fever and cough"
}
```

### React Flow

```text
Dashboard
→ Queue View
→ Click Patient
→ Consultation Screen
→ Save Visit
→ Generate Prescription
```

### Key UI Screens

- Reception Dashboard
- Doctor Consultation Screen
- Prescription Editor
- Billing Screen
- Reports Dashboard

---

## 7. Security, Compliance & India-Specific

### Security

- Clinic-level data isolation (tenant_id)
- Role-based access
- Audit logs

### Compliance (India)

- Avoid diagnosis claims (legal)
- Store data in India (if possible)
- Consent for WhatsApp messages
- GST-ready invoices

---

## 8. Monetization Model

| Plan                   | Price (₹/month) |
| ---------------------- | --------------- |
| Solo Doctor            | 499             |
| Small Clinic (3 users) | 1,499           |
| Multi-doctor           | 2,999+          |

Add-ons:

- SMS/WhatsApp credits
- Teleconsultation
- Inventory

---

## 9. Suggested MVP Build Order (12 weeks)

1. Auth + Clinic setup
2. Patient & visit
3. Prescription + PDF
4. Queue & appointment
5. Billing
6. Reports

---
