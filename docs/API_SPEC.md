# JivaDesk API Specification

## Overview

RESTful API built with FastAPI. All endpoints return JSON.

**Base URL:** `/api`

---

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth Module

#### POST /api/auth/register

Register new doctor + create clinic.

**Request:**

```json
{
  "email": "doctor@clinic.com",
  "password": "securepassword123",
  "clinic_name": "City Care Clinic"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "email": "doctor@clinic.com",
  "clinic_id": "uuid",
  "is_profile_complete": false,
  "message": "Registration successful"
}
```

**Errors:**

- `400` - Email already registered
- `422` - Validation error

---

#### POST /api/auth/login

Login and get JWT token.

**Request:**

```json
{
  "email": "doctor@clinic.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "doctor@clinic.com",
    "name": "Dr. Name",
    "is_profile_complete": false
  }
}
```

**Errors:**

- `401` - Invalid credentials

---

#### GET /api/auth/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "uuid",
  "email": "doctor@clinic.com",
  "name": "Dr. Ramesh Kumar",
  "phone": "9876543210",
  "medical_reg_number": "KMC/12345",
  "qualification": "MBBS, MD",
  "specialization": "General Physician",
  "is_profile_complete": true,
  "clinic": {
    "id": "uuid",
    "name": "City Care Clinic",
    "address": "123, Main Road, Bangalore",
    "phone": "080-12345678"
  }
}
```

---

#### PUT /api/auth/profile

Update doctor profile (first-login wizard or later edits).

**Request:**

```json
{
  "name": "Dr. Ramesh Kumar",
  "phone": "9876543210",
  "medical_reg_number": "KMC/12345",
  "qualification": "MBBS, MD",
  "specialization": "General Physician",
  "clinic": {
    "name": "City Care Clinic",
    "address": "123, Main Road, Bangalore",
    "phone": "080-12345678"
  }
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "is_profile_complete": true
}
```

---

### Patient Module

#### GET /api/patients

List patients for clinic with optional search.

**Query Parameters:**

- `search` (string) - Search by phone or name
- `page` (int, default: 1)
- `limit` (int, default: 20)

**Response (200):**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Suresh Kumar",
      "phone": "9876543210",
      "age": 45,
      "gender": "M",
      "last_visit": "2026-01-20"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

---

#### POST /api/patients

Create new patient.

**Request:**

```json
{
  "name": "Suresh Kumar",
  "phone": "9876543210",
  "dob": "1981-05-15",
  "gender": "M",
  "address": "456, 2nd Cross, Bangalore",
  "blood_group": "B+"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Suresh Kumar",
  "phone": "9876543210",
  "dob": "1981-05-15",
  "age": 44,
  "gender": "M",
  "address": "456, 2nd Cross, Bangalore",
  "blood_group": "B+",
  "created_at": "2026-01-22T10:30:00Z"
}
```

**Errors:**

- `400` - Patient with this phone already exists

---

#### GET /api/patients/{id}

Get patient details with visit history.

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Suresh Kumar",
  "phone": "9876543210",
  "dob": "1981-05-15",
  "age": 44,
  "gender": "M",
  "address": "456, 2nd Cross, Bangalore",
  "blood_group": "B+",
  "visits": [
    {
      "id": "uuid",
      "visit_date": "2026-01-20",
      "symptoms": "Fever, headache",
      "diagnosis": "Viral fever",
      "has_prescription": true
    },
    {
      "id": "uuid",
      "visit_date": "2025-12-10",
      "symptoms": "Cough, cold",
      "diagnosis": "Upper respiratory infection",
      "has_prescription": true
    }
  ],
  "total_visits": 2
}
```

---

#### PUT /api/patients/{id}

Update patient details.

**Request:**

```json
{
  "name": "Suresh Kumar",
  "phone": "9876543210",
  "address": "New Address, Bangalore"
}
```

**Response (200):**

```json
{
  "message": "Patient updated successfully"
}
```

---

### Visit Module

#### GET /api/visits

List visits with optional filters.

**Query Parameters:**

- `patient_id` (uuid) - Filter by patient
- `date_from` (date) - Start date
- `date_to` (date) - End date
- `page` (int, default: 1)
- `limit` (int, default: 20)

**Response (200):**

```json
{
  "items": [
    {
      "id": "uuid",
      "patient": {
        "id": "uuid",
        "name": "Suresh Kumar",
        "phone": "9876543210"
      },
      "visit_date": "2026-01-22",
      "symptoms": "Fever, body pain",
      "diagnosis": "Viral fever",
      "has_prescription": true
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

---

#### POST /api/visits

Create new visit.

**Request:**

```json
{
  "patient_id": "uuid",
  "visit_date": "2026-01-22",
  "symptoms": "Fever since 2 days, body pain, headache",
  "diagnosis": "Viral fever",
  "notes": "Patient advised rest. Review in 3 days if fever persists.",
  "follow_up_date": "2026-01-25"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "visit_date": "2026-01-22",
  "symptoms": "Fever since 2 days, body pain, headache",
  "diagnosis": "Viral fever",
  "notes": "Patient advised rest. Review in 3 days if fever persists.",
  "follow_up_date": "2026-01-25",
  "created_at": "2026-01-22T10:45:00Z"
}
```

---

#### GET /api/visits/{id}

Get visit details with prescription.

**Response (200):**

```json
{
  "id": "uuid",
  "patient": {
    "id": "uuid",
    "name": "Suresh Kumar",
    "phone": "9876543210",
    "age": 44,
    "gender": "M"
  },
  "doctor": {
    "id": "uuid",
    "name": "Dr. Ramesh Kumar",
    "qualification": "MBBS, MD"
  },
  "visit_date": "2026-01-22",
  "symptoms": "Fever since 2 days, body pain, headache",
  "diagnosis": "Viral fever",
  "notes": "Patient advised rest.",
  "follow_up_date": "2026-01-25",
  "prescription": {
    "id": "uuid",
    "advice": "Take rest. Drink plenty of fluids.",
    "items": [
      {
        "medicine_name": "Paracetamol 500mg",
        "dosage": "1-0-1",
        "duration": "3 days",
        "instructions": "After food"
      }
    ]
  }
}
```

---

#### PUT /api/visits/{id}

Update visit details.

**Request:**

```json
{
  "symptoms": "Updated symptoms",
  "diagnosis": "Updated diagnosis",
  "notes": "Updated notes",
  "follow_up_date": "2026-01-28"
}
```

**Response (200):**

```json
{
  "message": "Visit updated successfully"
}
```

---

### Prescription Module

#### POST /api/prescriptions

Create prescription for a visit.

**Request:**

```json
{
  "visit_id": "uuid",
  "advice": "Take rest. Drink plenty of fluids. Avoid cold drinks.",
  "items": [
    {
      "medicine_name": "Paracetamol 500mg",
      "dosage": "1-0-1",
      "duration": "3 days",
      "instructions": "After food"
    },
    {
      "medicine_name": "Azithromycin 500mg",
      "dosage": "0-0-1",
      "duration": "3 days",
      "instructions": "After dinner"
    },
    {
      "medicine_name": "Cetirizine 10mg",
      "dosage": "0-0-1",
      "duration": "5 days",
      "instructions": "At bedtime"
    }
  ]
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "visit_id": "uuid",
  "advice": "Take rest. Drink plenty of fluids. Avoid cold drinks.",
  "items": [...],
  "created_at": "2026-01-22T11:00:00Z"
}
```

---

#### GET /api/prescriptions/{id}

Get prescription details.

**Response (200):**

```json
{
  "id": "uuid",
  "visit_id": "uuid",
  "advice": "Take rest. Drink plenty of fluids.",
  "items": [
    {
      "id": "uuid",
      "medicine_name": "Paracetamol 500mg",
      "dosage": "1-0-1",
      "duration": "3 days",
      "instructions": "After food"
    }
  ],
  "created_at": "2026-01-22T11:00:00Z"
}
```

---

#### PUT /api/prescriptions/{id}

Update prescription.

**Request:**

```json
{
  "advice": "Updated advice",
  "items": [
    {
      "medicine_name": "Paracetamol 650mg",
      "dosage": "1-1-1",
      "duration": "5 days",
      "instructions": "After food"
    }
  ]
}
```

**Response (200):**

```json
{
  "message": "Prescription updated successfully"
}
```

---

#### GET /api/prescriptions/{id}/pdf

Generate and download prescription PDF.

**Response (200):**

- Content-Type: `application/pdf`
- Returns PDF binary

---

#### POST /api/prescriptions/{id}/whatsapp

Send prescription via WhatsApp (dummy for MVP).

**Request:**

```json
{
  "phone": "9876543210"
}
```

**Response (200):**

```json
{
  "message": "WhatsApp message queued",
  "status": "pending",
  "note": "WhatsApp integration not active in MVP"
}
```

---

### Medicine Module

#### GET /api/medicines

Search medicines for autocomplete.

**Query Parameters:**

- `search` (string) - Search by name or generic name
- `limit` (int, default: 20)

**Response (200):**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Paracetamol 500mg",
      "generic_name": "Paracetamol",
      "category": "Analgesic",
      "form": "Tablet"
    },
    {
      "id": "uuid",
      "name": "Paracetamol 650mg",
      "generic_name": "Paracetamol",
      "category": "Analgesic",
      "form": "Tablet"
    }
  ]
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "detail": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code                  | HTTP Status | Description           |
| --------------------- | ----------- | --------------------- |
| `INVALID_CREDENTIALS` | 401         | Wrong email/password  |
| `TOKEN_EXPIRED`       | 401         | JWT token expired     |
| `NOT_FOUND`           | 404         | Resource not found    |
| `DUPLICATE_ENTRY`     | 400         | Record already exists |
| `VALIDATION_ERROR`    | 422         | Invalid request data  |
| `FORBIDDEN`           | 403         | Access denied         |

---

## Pagination

All list endpoints support pagination:

**Request:**

```
GET /api/patients?page=2&limit=10
```

**Response includes:**

```json
{
  "items": [...],
  "total": 150,
  "page": 2,
  "limit": 10,
  "pages": 15
}
```
