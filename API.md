# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "securepassword",
  "firstName": "Dr. Rajesh",
  "lastName": "Kumar",
  "role": "doctor",
  "phoneNumber": "9876543210",
  "specialization": "General Physician",
  "licenseNumber": "MCI12345",
  "clinicName": "Kumar Clinic",
  "clinicAddress": "123 MG Road, Bangalore",
  "gstNumber": "29ABCDE1234F1Z5"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "doctor@example.com",
    "firstName": "Dr. Rajesh",
    "lastName": "Kumar",
    "role": "doctor",
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Patients

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Amit",
  "lastName": "Sharma",
  "dateOfBirth": "1985-05-15",
  "gender": "male",
  "phoneNumber": "9876543210",
  "email": "amit@example.com",
  "address": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "bloodGroup": "O+",
  "medicalHistory": "Diabetes since 2010",
  "allergies": "Penicillin",
  "emergencyContactName": "Priya Sharma",
  "emergencyContactPhone": "9876543211"
}
```

#### Get All Patients
```http
GET /api/patients
Authorization: Bearer <token>
```

#### Get Single Patient
```http
GET /api/patients/:id
Authorization: Bearer <token>
```

#### Update Patient
```http
PUT /api/patients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "9876543999",
  "email": "newemail@example.com"
}
```

#### Delete Patient
```http
DELETE /api/patients/:id
Authorization: Bearer <token>
```

### Appointments

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2024-03-20",
  "appointmentTime": "10:30:00",
  "duration": 30,
  "reason": "Regular checkup",
  "status": "scheduled"
}
```

#### Get Appointments
```http
GET /api/appointments
GET /api/appointments?date=2024-03-20
GET /api/appointments?doctorId=doctor-uuid
GET /api/appointments?status=scheduled
Authorization: Bearer <token>
```

#### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Patient examined and prescription given"
}
```

### Medical Records

#### Create Medical Record
```http
POST /api/medical-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "chiefComplaint": "Fever and cough",
  "symptoms": "High fever (102°F), dry cough, body ache",
  "diagnosis": "Viral fever",
  "prescription": "Paracetamol 500mg - 1 tablet 3 times daily for 3 days\nCetrizine 10mg - 1 tablet at night",
  "labTests": "Complete blood count (CBC)",
  "notes": "Advised rest and fluid intake",
  "followUpDate": "2024-03-27"
}
```

#### Get Medical Records
```http
GET /api/medical-records?patientId=patient-uuid
Authorization: Bearer <token>
```

#### Get Single Medical Record
```http
GET /api/medical-records/:id
Authorization: Bearer <token>
```

### Invoices

#### Create Invoice
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "items": [
    {
      "description": "Consultation Fee",
      "quantity": 1,
      "rate": 500,
      "amount": 500
    },
    {
      "description": "ECG Test",
      "quantity": 1,
      "rate": 300,
      "amount": 300
    }
  ],
  "gstPercentage": 18,
  "paymentMethod": "upi",
  "paymentStatus": "paid"
}
```

The system will automatically calculate:
- `subtotal`: Sum of all items (₹800)
- `gstAmount`: 18% of subtotal (₹144)
- `totalAmount`: Subtotal + GST (₹944)
- `invoiceNumber`: Auto-generated (e.g., INV-2024-00001)

#### Get Invoices
```http
GET /api/invoices
GET /api/invoices?status=pending
GET /api/invoices?patientId=patient-uuid
Authorization: Bearer <token>
```

#### Update Invoice Payment
```http
PUT /api/invoices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "paymentDate": "2024-03-20T14:30:00Z"
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Data Validation

### Indian Phone Number
- Format: 10 digits starting with 6-9
- Example: 9876543210

### Pincode
- Format: 6 digits
- Example: 560001

### GST Number
- Format: 15 characters (2 digits + 5 letters + 4 digits + 1 letter + 1 letter/digit + Z + 1 letter/digit)
- Example: 29ABCDE1234F1Z5

## Payment Methods
- `cash`: Cash payment
- `upi`: UPI payment (Google Pay, PhonePe, etc.)
- `card`: Credit/Debit card
- `netbanking`: Net banking
- `wallet`: Mobile wallet (Paytm, etc.)

## User Roles
- `admin`: Full system access
- `doctor`: Access to patients, appointments, medical records
- `receptionist`: Access to patients and appointments
