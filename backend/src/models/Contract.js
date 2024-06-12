const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pdfUrl: { type: String, required: true },
  realtorSignature: { type: String, default: '' },
  clientSignature: { type: String, default: '' },
  isFinalized: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
