const express = require('express');
const router = express.Router();
const { Storage } = require('@google-cloud/storage');
const ContractTemplate = require('../models/ContractTemplate');
const Contract = require('../models/Contract');
const { createFilledContractPDF, uploadToGoogleCloud } = require('../utils/pdfUtils');
const ensureAuthenticated = require('./authRoutes');

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

router.post('/share-contract/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { clientId } = req.body;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    contract.sharedWith.push(clientId);
    await contract.save();

    res.json({ message: 'Contract shared with client successfully', contract });
  } catch (error) {
    console.error('Error sharing contract:', error);
    res.status(500).json({ error: 'Failed to share contract' });
  }
});

router.post('/add-realtor-signature/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { signature } = req.body;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    contract.realtorSignature = signature;
    await contract.save();

    res.json({ message: 'Realtor signature added', contract });
  } catch (error) {
    console.error('Error adding realtor signature:', error);
    res.status(500).json({ error: 'Failed to add realtor signature' });
  }
});

router.post('/add-client-signature/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { signature } = req.body;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.isFinalized) {
      return res.status(403).json({ error: 'Contract is already finalized' });
    }

    contract.clientSignature = signature;
    contract.isFinalized = true;
    await contract.save();

    res.json({ message: 'Client signature added and contract finalized', contract });
  } catch (error) {
    console.error('Error adding client signature:', error);
    res.status(500).json({ error: 'Failed to add client signature' });
  }
});

router.get('/all', ensureAuthenticated, async (req, res) => {
  try {
    const contracts = await Contract.find({ 
      $or: [
        { userId: req.user.id },
        { sharedWith: req.user.id }
      ]
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract || !(contract.userId.toString() === req.user.id.toString() || contract.sharedWith.includes(req.user.id))) {
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


// Temporary route for testing PDF generation without uploading
router.post('/view-pdf', ensureAuthenticated, async (req, res) => {
  const { templateId, placeholders } = req.body;

  try {
    const template = await ContractTemplate.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const pdfBuffer = await createFilledContractPDF(template.content, placeholders);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
