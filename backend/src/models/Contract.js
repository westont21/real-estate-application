const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
