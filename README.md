# JivaDesk 🏥

A comprehensive SaaS platform for independent doctors and small outpatient clinics in India. JivaDesk helps healthcare providers manage their practice efficiently with patient management, appointment scheduling, medical records, and billing with full GST compliance.

## Features ✨

### Core Features
- **Patient Management** - Complete patient records with demographics, medical history, and contact information
- **Appointment Scheduling** - Calendar-based appointment booking with status tracking
- **Medical Records** - Digital consultation notes, prescriptions, and follow-up tracking
- **Billing & Invoicing** - GST-compliant invoicing with Indian payment methods support
- **User Authentication** - Secure JWT-based authentication with role-based access control

### India-Specific Features 🇮🇳
- ✅ GST calculations and compliant invoicing
- ✅ Indian phone number validation (10-digit format)
- ✅ Indian pincode validation
- ✅ Support for multiple payment methods (Cash, UPI, Card, Net Banking, Wallet)
- ✅ GST number validation

## Tech Stack 🛠️

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM for database management
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Installation 🚀

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/reachsriharsha/jivadesk.git
cd jivadesk
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jivadesk
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=30d

# GST Settings
GST_PERCENTAGE=18
```

4. **Create PostgreSQL database**
```bash
createdb jivadesk
```
Or using psql:
```sql
CREATE DATABASE jivadesk;
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Documentation 📚

### Authentication Endpoints

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
  "clinicName": "Kumar Clinic",
  "gstNumber": "29ABCDE1234F1Z5"
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

### Patient Management

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
  "allergies": "Penicillin"
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

### Appointment Management

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
  "reason": "Regular checkup"
}
```

#### Get Appointments
```http
GET /api/appointments?date=2024-03-20&status=scheduled
Authorization: Bearer <token>
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
  "symptoms": "High fever, dry cough, body ache",
  "diagnosis": "Viral fever",
  "prescription": "Paracetamol 500mg - 1 tablet 3 times daily",
  "labTests": "Complete blood count",
  "followUpDate": "2024-03-27"
}
```

#### Get Medical Records
```http
GET /api/medical-records?patientId=patient-uuid
Authorization: Bearer <token>
```

### Invoice Management

#### Create Invoice (with GST)
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
  "paymentMethod": "upi"
}
```

Invoice calculation:
- Subtotal: ₹800
- GST (18%): ₹144
- Total: ₹944

#### Get Invoices
```http
GET /api/invoices?status=pending
Authorization: Bearer <token>
```

## Database Schema 🗄️

### Tables
- **users** - Doctors, admins, and receptionists
- **patients** - Patient demographics and medical history
- **appointments** - Scheduled appointments
- **medical_records** - Consultation records and prescriptions
- **invoices** - Bills with GST calculations

## User Roles 👥

1. **Doctor** - Full access to patients, appointments, medical records
2. **Admin** - Complete system access and user management
3. **Receptionist** - Patient and appointment management

## Security Features 🔒

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API endpoints
- Input validation for Indian formats (phone, pincode, GST)

## Development 💻

### Project Structure
```
jivadesk/
├── server/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth and other middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

### Running in Development
```bash
npm run dev
```

The server will restart automatically on file changes.

## Future Enhancements 🚀

- [ ] React frontend with TypeScript
- [ ] SMS/Email appointment reminders
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Payment gateway integration (Razorpay/PayU)
- [ ] Prescription templates
- [ ] Patient portal
- [ ] Multi-clinic support
- [ ] Inventory management

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Support 💬

For support, email support@jivadesk.com or raise an issue in the repository.

---

Made with ❤️ for healthcare providers in India