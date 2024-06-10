const express = require('express');
const router = express.Router();
const { Storage } = require('@google-cloud/storage');
const ContractTemplate = require('../models/ContractTemplate');
const Contract = require('../models/Contract');
const { createFilledContractPDF, uploadToGoogleCloud } = require('../utils/pdfUtils');
const ensureAuthenticated = require('./authRoutes');

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.CONTRACT_SERVICE_ACCOUNT_PATH,
  projectId: process.env.PROJECT_ID
});
const bucket = storage.bucket(process.env.CONTRACT_PDF_BUCKET_NAME);

router.get('/templates', ensureAuthenticated, async (req, res) => {
  try {
    const templates = await ContractTemplate.find({}, 'name description content');
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.post('/fill-template', ensureAuthenticated, async (req, res) => {
  const { templateId, placeholders } = req.body;

  if (!templateId || !placeholders) {
    return res.status(400).json({ error: 'Template ID and placeholders are required' });
  }

  try {
    const template = await ContractTemplate.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const pdfBuffer = await createFilledContractPDF(template.content, placeholders);
    const filePath = await uploadToGoogleCloud(pdfBuffer, req.user.id);

    const contract = new Contract({
      userId: req.user.id,
      pdfUrl: filePath
    });
    await contract.save();

    res.json({ message: 'Contract generated and uploaded successfully', contract });
  } catch (error) {
    console.error('Error filling template and generating PDF:', error);
    res.status(500).json({ error: 'Failed to fill template and generate PDF' });
  }
});

router.get('/all', ensureAuthenticated, async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user.id });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract || contract.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const file = bucket.file(contract.pdfUrl);

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    const [url] = await file.getSignedUrl(options);
    res.json({ url });
  } catch (error) {
    console.error('Error fetching contract URL:', error);
    res.status(500).json({ error: 'Failed to fetch contract URL' });
  }
});

module.exports = router;
