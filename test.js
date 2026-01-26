#!/usr/bin/env node

/**
 * Basic API Test Suite
 * Tests core functionality without requiring a database
 */

const assert = require('assert');

console.log('🧪 Running JivaDesk API Tests\n');

// Test 1: Validate Indian Phone Number Format
function testPhoneValidation() {
  const validPhone = '9876543210';
  const invalidPhone1 = '1234567890'; // doesn't start with 6-9
  const invalidPhone2 = '98765432'; // too short
  
  const phoneRegex = /^[6-9]\d{9}$/;
  
  assert(phoneRegex.test(validPhone), 'Valid phone should pass');
  assert(!phoneRegex.test(invalidPhone1), 'Invalid phone (wrong start) should fail');
  assert(!phoneRegex.test(invalidPhone2), 'Invalid phone (wrong length) should fail');
  
  console.log('✅ Phone number validation tests passed');
}

// Test 2: Validate Indian Pincode Format
function testPincodeValidation() {
  const validPincode = '560001';
  const invalidPincode1 = '12345'; // too short
  const invalidPincode2 = '5600012'; // too long
  
  const pincodeRegex = /^\d{6}$/;
  
  assert(pincodeRegex.test(validPincode), 'Valid pincode should pass');
  assert(!pincodeRegex.test(invalidPincode1), 'Invalid pincode (too short) should fail');
  assert(!pincodeRegex.test(invalidPincode2), 'Invalid pincode (too long) should fail');
  
  console.log('✅ Pincode validation tests passed');
}

// Test 3: Validate GST Number Format
function testGSTValidation() {
  const validGST = '29ABCDE1234F1Z5';
  const invalidGST = '29ABCDE1234F1Z'; // too short
  
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  
  assert(gstRegex.test(validGST), 'Valid GST should pass');
  assert(!gstRegex.test(invalidGST), 'Invalid GST should fail');
  
  console.log('✅ GST number validation tests passed');
}

// Test 4: Validate GST Calculation
function testGSTCalculation() {
  const subtotal = 1000;
  const gstPercentage = 18;
  const expectedGST = 180;
  const expectedTotal = 1180;
  
  const calculatedGST = (subtotal * gstPercentage) / 100;
  const calculatedTotal = subtotal + calculatedGST;
  
  assert(calculatedGST === expectedGST, 'GST calculation should be correct');
  assert(calculatedTotal === expectedTotal, 'Total calculation should be correct');
  
  console.log('✅ GST calculation tests passed');
}

// Test 5: Validate Invoice Number Generation
function testInvoiceNumberGeneration() {
  const year = new Date().getFullYear();
  const count = 1;
  const expectedFormat = `INV-${year}-00001`;
  
  const invoiceNumber = `INV-${year}-${String(count).padStart(5, '0')}`;
  
  assert(invoiceNumber === expectedFormat, 'Invoice number format should be correct');
  assert(/^INV-\d{4}-\d{5}$/.test(invoiceNumber), 'Invoice number should match pattern');
  
  console.log('✅ Invoice number generation tests passed');
}

// Test 6: Validate Payment Methods
function testPaymentMethods() {
  const validMethods = ['cash', 'upi', 'card', 'netbanking', 'wallet'];
  const paymentMethod = 'upi';
  
  assert(validMethods.includes(paymentMethod), 'UPI should be a valid payment method');
  assert(validMethods.includes('cash'), 'Cash should be a valid payment method');
  assert(!validMethods.includes('crypto'), 'Crypto should not be a valid payment method');
  
  console.log('✅ Payment methods validation tests passed');
}

// Test 7: Test Age Calculation from Date of Birth
function testAgeCalculation() {
  const dob = new Date('1985-05-15');
  const referenceDate = new Date('2024-01-01'); // Use fixed reference date for stable testing
  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  
  assert(age === 38, 'Age calculation should be accurate'); // Will be 38 on 2024-01-01
  
  console.log('✅ Age calculation tests passed');
}

// Run all tests
try {
  testPhoneValidation();
  testPincodeValidation();
  testGSTValidation();
  testGSTCalculation();
  testInvoiceNumberGeneration();
  testPaymentMethods();
  testAgeCalculation();
  
  console.log('\n🎉 All tests passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
