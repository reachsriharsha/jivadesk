#!/bin/bash
# Test script for AUTH-001 Registration API

BASE_URL="http://localhost:8000/api/v1/auth"

echo "=== Testing Doctor Registration API ==="
echo

# Test 1: Check email availability
echo "Test 1: Check if email is available"
echo "GET $BASE_URL/check-email?email=doctor@test.com"
curl -s -X GET "$BASE_URL/check-email?email=doctor@test.com" | python3 -m json.tool
echo
echo

# Test 2: Check phone availability
echo "Test 2: Check if phone is available"
echo "GET $BASE_URL/check-phone?phone=9876543210"
curl -s -X GET "$BASE_URL/check-phone?phone=9876543210" | python3 -m json.tool
echo
echo

# Test 3: Register a new doctor
echo "Test 3: Register a new doctor"
echo "POST $BASE_URL/register"
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "phone": "9876543210",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "terms_accepted": true
  }' | python3 -m json.tool
echo
echo

# Test 4: Try to register with the same email (should fail)
echo "Test 4: Try to register with same email (should fail)"
echo "POST $BASE_URL/register"
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "phone": "9876543211",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "terms_accepted": true
  }' | python3 -m json.tool
echo
echo

# Test 5: Check email availability (should be taken now)
echo "Test 5: Check if email is available (should be false)"
echo "GET $BASE_URL/check-email?email=doctor@test.com"
curl -s -X GET "$BASE_URL/check-email?email=doctor@test.com" | python3 -m json.tool
echo
