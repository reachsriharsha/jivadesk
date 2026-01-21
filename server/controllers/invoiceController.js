const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

// @desc    Get all invoices
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const { status, patientId } = req.query;
    const where = {};
    
    if (status) {
      where.paymentStatus = status;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    
    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Patient, attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] }
      ],
      order: [['invoiceDate', 'DESC']]
    });
    
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Patient }]
    });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { items, gstPercentage = 18 } = req.body;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const gstAmount = (subtotal * gstPercentage) / 100;
    const totalAmount = subtotal + gstAmount;
    
    // Generate invoice number
    const count = await Invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    
    const invoice = await Invoice.create({
      ...req.body,
      invoiceNumber,
      subtotal,
      gstPercentage,
      gstAmount,
      totalAmount
    });
    
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Recalculate if items changed
    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const gstPercentage = req.body.gstPercentage || invoice.gstPercentage;
      const gstAmount = (subtotal * gstPercentage) / 100;
      const totalAmount = subtotal + gstAmount;
      
      req.body.subtotal = subtotal;
      req.body.gstAmount = gstAmount;
      req.body.totalAmount = totalAmount;
    }
    
    await invoice.update(req.body);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    await invoice.destroy();
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
