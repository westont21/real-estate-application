const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ContractTemplate = require('../models/ContractTemplate');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const {createFilledContractPDF, uploadToGoogleCloud} = require('../utils/pdfUtils')
require('dotenv').config();

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.SERVICE_ACCOUNT_PATH,
  projectId: process.env.PROJECT_ID
});
const bucket = storage.bucket(process.env.CONTRACT_PDF_BUCKET_NAME);

// Route to fetch all templates
router.get('/templates', ensureAuthenticated,  async (req, res) => {
  try {
    // Fetch templates with name and content only
    const templates = await ContractTemplate.find({}, 'name content');
    res.json(templates);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch templates' });
  }
});

// Route to fill a template and generate a PDF
router.post('/fill-template', ensureAuthenticated, async (req, res) => {
    const { templateId, placeholders } = req.body;
  
    try {
      const template = await ContractTemplate.findById(templateId);
      if (!template) return res.status(404).send({ error: 'Template not found' });
  
      // Generate filled PDF
      const { filledTemplate, pdfPath } = await createFilledContractPDF(template.content, placeholders);
  
      // Upload PDF to Google Cloud Storage
      const pdfUrl = await uploadToGoogleCloud(pdfPath);
  
      res.json({ pdfUrl }); // Return the URL of the uploaded PDF
    } catch (error) {
      console.error('Error filling template and generating PDF:', error);
      res.status(500).send({ error: 'Failed to fill template and generate PDF' });
    }
  });

module.exports = router;
