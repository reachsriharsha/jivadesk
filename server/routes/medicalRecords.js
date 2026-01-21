const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMedicalRecords)
  .post(createMedicalRecord);

router.route('/:id')
  .get(getMedicalRecord)
  .put(updateMedicalRecord)
  .delete(deleteMedicalRecord);

module.exports = router;
