#!/bin/bash
# Quick Start Script for DES-001 Frontend Testing

echo "========================================="
echo "DES-001 Frontend Quick Start"
echo "========================================="
echo ""

# Check if backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "   ✓ Backend is running on http://localhost:8000"
else
    echo "   ✗ Backend is NOT running!"
    echo "   Start backend with: cd /home/sharsha/src/jivadesk/src/backend && source app/.venv/bin/activate && uvicorn app.main:app --reload"
    echo ""
fi

# Check if frontend is running
echo "2. Checking frontend server..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✓ Frontend is running on http://localhost:5173"
else
    echo "   ✗ Frontend is NOT running!"
    echo "   Start frontend with: cd /home/sharsha/src/jivadesk/src/frontend && bun run dev"
    echo ""
fi

# Check database
echo "3. Checking database..."
if docker ps | grep -q "docker_db_1"; then
    echo "   ✓ Database is running"
else
    echo "   ✗ Database is NOT running!"
    echo "   Start database with: cd /home/sharsha/src/jivadesk/docker && docker-compose up -d db"
    echo ""
fi

echo ""
echo "========================================="
echo "Test URLs"
echo "========================================="
echo "Frontend Home:     http://localhost:5173"
echo "Registration Page: http://localhost:5173/register"
echo "Backend API Docs:  http://localhost:8000/docs"
echo ""

echo "========================================="
echo "Test Data"
echo "========================================="
echo "Email:    doctor@test.com"
echo "Phone:    9876543210"
echo "Password: SecurePass123"
echo ""

echo "========================================="
echo "Manual Testing Steps"
echo "========================================="
echo "1. Open http://localhost:5173/register in browser"
echo "2. Fill in the registration form:"
echo "   - Email: doctor@test.com"
echo "   - Phone: 9876543210"
echo "   - Password: SecurePass123"
echo "   - Confirm Password: SecurePass123"
echo "   - Accept Terms: ✓"
echo "3. Click 'Create Account'"
echo "4. Verify success message or check browser console"
echo "5. Check if tokens are stored in localStorage"
echo ""

echo "========================================="
echo "Automated Test Commands"
echo "========================================="
echo "Test email availability:"
echo "  curl 'http://localhost:8000/api/v1/auth/check-email?email=test@example.com'"
echo ""
echo "Test phone availability:"
echo "  curl 'http://localhost:8000/api/v1/auth/check-phone?phone=9876543210'"
echo ""
echo "Test registration:"
echo "  curl -X POST http://localhost:8000/api/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"doctor@test.com\",\"phone\":\"9876543210\",\"password\":\"SecurePass123\",\"confirm_password\":\"SecurePass123\",\"terms_accepted\":true}'"
echo ""

echo "========================================="
echo "Troubleshooting"
echo "========================================="
echo "If you see CORS errors:"
echo "  - Check backend logs"
echo "  - Verify API_URL in frontend/.env"
echo ""
echo "If registration fails:"
echo "  - Check backend logs for errors"
echo "  - Verify database is running"
echo "  - Check network tab in browser DevTools"
echo ""
echo "If email/phone already exists:"
echo "  - Use different credentials"
echo "  - Or delete user from database:"
echo "    docker-compose exec -T db psql -U jivadesk -d jivadesk -c \"DELETE FROM users WHERE email='doctor@test.com'\""
echo ""

echo "========================================="
echo "Ready to test!"
echo "========================================="
