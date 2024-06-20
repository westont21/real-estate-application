const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractTemplate', required: true },
  pdfUrl: { type: String, required: true },
  realtorSignature: { type: String },
  clientSignature: { type: String },
  placeholders: { type: Map, of: String },
  isFinalized: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false } // Soft delete field
});

module.exports = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
