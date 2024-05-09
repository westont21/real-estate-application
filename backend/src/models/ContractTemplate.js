// models/ContractTemplate.js

const mongoose = require('mongoose');

const contractTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the template, e.g., "Realtor-Buyer Agreement"
  description: { type: String, required: true },
  content: { type: Object, required: true }, // The template content with placeholders
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContractTemplate', contractTemplateSchema);
