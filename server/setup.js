const sequelize = require('./config/database');
const { User, Patient, Appointment, MedicalRecord, Invoice } = require('./models');

const setupDatabase = async () => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    console.log('\nSynchronizing models with database...');
    await sequelize.sync({ force: true }); // Warning: This will drop existing tables
    console.log('✓ All models synchronized');
    
    console.log('\nCreating sample data...');
    
    // Create a sample doctor
    const doctor = await User.create({
      email: 'doctor@jivadesk.com',
      password: 'password123',
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      role: 'doctor',
      phoneNumber: '9876543210',
      specialization: 'General Physician',
      licenseNumber: 'MCI12345',
      clinicName: 'Kumar Clinic',
      clinicAddress: '123 MG Road, Bangalore, Karnataka',
      gstNumber: '29ABCDE1234F1Z5'
    });
    console.log('✓ Sample doctor created');
    
    // Create sample patients
    const patient1 = await Patient.create({
      firstName: 'Amit',
      lastName: 'Sharma',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      phoneNumber: '9876543211',
      email: 'amit@example.com',
      address: '456 Park Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      bloodGroup: 'O+',
      medicalHistory: 'Diabetes since 2010',
      allergies: 'Penicillin',
      emergencyContactName: 'Priya Sharma',
      emergencyContactPhone: '9876543212'
    });
    
    const patient2 = await Patient.create({
      firstName: 'Priya',
      lastName: 'Patel',
      dateOfBirth: '1990-08-22',
      gender: 'female',
      phoneNumber: '9876543213',
      email: 'priya@example.com',
      address: '789 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560002',
      bloodGroup: 'A+',
      allergies: 'None'
    });
    console.log('✓ Sample patients created');
    
    // Create sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointment1 = await Appointment.create({
      patientId: patient1.id,
      doctorId: doctor.id,
      appointmentDate: tomorrow,
      appointmentTime: '10:30:00',
      duration: 30,
      status: 'scheduled',
      reason: 'Regular checkup'
    });
    
    const appointment2 = await Appointment.create({
      patientId: patient2.id,
      doctorId: doctor.id,
      appointmentDate: tomorrow,
      appointmentTime: '11:00:00',
      duration: 30,
      status: 'scheduled',
      reason: 'Fever and cough'
    });
    console.log('✓ Sample appointments created');
    
    // Create a sample medical record
    const medicalRecord = await MedicalRecord.create({
      patientId: patient1.id,
      doctorId: doctor.id,
      chiefComplaint: 'Annual checkup',
      symptoms: 'No specific symptoms',
      diagnosis: 'Healthy',
      prescription: 'Continue diabetes medication',
      notes: 'Blood sugar levels under control'
    });
    console.log('✓ Sample medical record created');
    
    // Create a sample invoice
    const invoice = await Invoice.create({
      invoiceNumber: 'INV-2024-00001',
      patientId: patient1.id,
      appointmentId: appointment1.id,
      items: [
        {
          description: 'Consultation Fee',
          quantity: 1,
          rate: 500,
          amount: 500
        },
        {
          description: 'Blood Sugar Test',
          quantity: 1,
          rate: 200,
          amount: 200
        }
      ],
      subtotal: 700,
      gstPercentage: 18,
      gstAmount: 126,
      totalAmount: 826,
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      paymentDate: new Date()
    });
    console.log('✓ Sample invoice created');
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nSample credentials:');
    console.log('Email: doctor@jivadesk.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
