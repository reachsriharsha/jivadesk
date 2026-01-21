# JivaDesk - Quick Start Guide

## Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

## Installation

1. Install PostgreSQL (if not already installed):

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### On macOS:
```bash
brew install postgresql
brew services start postgresql
```

### On Windows:
Download and install from: https://www.postgresql.org/download/windows/

2. Create Database:
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE jivadesk;
CREATE USER jivadesk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jivadesk TO jivadesk_user;
\q
```

3. Install Dependencies:
```bash
cd jivadesk
npm install
```

4. Configure Environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Setup Database (Optional - creates sample data):
```bash
node server/setup.js
```

6. Start Server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

7. Access Application:
Open browser and go to: http://localhost:5000

## Testing the API

### Using cURL

1. Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Doctor",
    "role": "doctor"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. Create a patient (replace YOUR_TOKEN):
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "phoneNumber": "9876543210",
    "email": "john@example.com"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set base URL: http://localhost:5000
3. For protected routes, add Authorization header: `Bearer YOUR_TOKEN`

## Sample Credentials (if you ran setup.js)
```
Email: doctor@jivadesk.com
Password: password123
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 5000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall

## Next Steps

1. Explore the API using the web interface at http://localhost:5000
2. Read API documentation in API.md
3. Test all endpoints using Postman or cURL
4. Customize for your clinic's needs

## Support
For issues, please create an issue in the GitHub repository.
