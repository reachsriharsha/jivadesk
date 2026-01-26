const User = require('./User');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Invoice = require('./Invoice');

// Define relationships
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(MedicalRecord, { foreignKey: 'doctorId' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId' });

Appointment.hasOne(MedicalRecord, { foreignKey: 'appointmentId' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Patient.hasMany(Invoice, { foreignKey: 'patientId' });
Invoice.belongsTo(Patient, { foreignKey: 'patientId' });

Appointment.hasOne(Invoice, { foreignKey: 'appointmentId' });
Invoice.belongsTo(Appointment, { foreignKey: 'appointmentId' });

module.exports = {
  User,
  Patient,
  Appointment,
  MedicalRecord,
  Invoice
};
