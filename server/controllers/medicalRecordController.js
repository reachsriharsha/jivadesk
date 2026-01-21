const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

// @desc    Get medical records for a patient
// @route   GET /api/medical-records
exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = {};
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    const records = await MedicalRecord.findAll({
      where,
      include: [
        { model: Patient, attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['visitDate', 'DESC']]
    });
    
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
exports.getMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [{ model: Patient }]
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new medical record
// @route   POST /api/medical-records
exports.createMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    await record.update(req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    await record.destroy();
    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
