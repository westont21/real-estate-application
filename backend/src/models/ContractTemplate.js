const mongoose = require('mongoose');

const contractTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ContractTemplate || mongoose.model('ContractTemplate', contractTemplateSchema);
