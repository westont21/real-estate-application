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
  const { templateId, placeholders, signature } = req.body;

  if (!templateId || !placeholders || !signature) {
    return res.status(400).json({ error: 'Template ID, placeholders, and signature are required.' });
  }

  try {
    const template = await ContractTemplate.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Add realtor's signature to placeholders
    const updatedPlaceholders = { ...placeholders, realtor_signature: signature };

    // Create the PDF
    const pdfBuffer = await createFilledContractPDF(template.content, updatedPlaceholders);
    const filePath = await uploadToGoogleCloud(pdfBuffer, req.user.id);

    // Save the contract with placeholders and signatures
    const contract = new Contract({
      userId: req.user.id,
      templateId: templateId,
      pdfUrl: filePath,
      realtorSignature: signature, // Save realtor's signature separately
      placeholders: updatedPlaceholders,
      sharedWith: [],
      isFinalized: false
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


//Don't need 
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

    // Update the PDF with the realtor's signature
    const template = await ContractTemplate.findById(contract.templateId);
    const updatedPlaceholders = {
      ...contract.placeholders,
      realtor_signature: signature
    };
    const pdfBuffer = await createFilledContractPDF(template.content, updatedPlaceholders);
    const filePath = await uploadToGoogleCloud(pdfBuffer, contract.userId);
    contract.pdfUrl = filePath;
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

    // Update the client signature in the contract document
    contract.clientSignature = signature;
    contract.placeholders.set('client_signature', signature);

    const template = await ContractTemplate.findById(contract.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create the updated PDF with the client signature
    const pdfBuffer = await createFilledContractPDF(template.content, contract.placeholders);
    const filePath = await uploadToGoogleCloud(pdfBuffer, contract.userId);

    // Update the contract's PDF URL
    contract.pdfUrl = filePath;

    await contract.save();

    res.json({ message: 'Client signature added and PDF updated successfully' });
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
    console.log('Fetching contract with ID:', req.params.id);
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      console.log('Contract not found');
      return res.status(404).json({ error: 'Contract not found' });
    }

    console.log('Contract found:', contract);

    if (!(contract.userId.toString() === req.user.id.toString() || contract.sharedWith.includes(req.user.id))) {
      console.log('Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const template = await ContractTemplate.findById(contract.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const file = bucket.file(contract.pdfUrl);

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    const [url] = await file.getSignedUrl(options);

    res.json({
      url,
      templateContent: template.content,
      placeholders: contract.placeholders,
      clientSignature: contract.clientSignature,
      realtorSignature: contract.realtorSignature,
      isFinalized: contract.isFinalized,
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
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
