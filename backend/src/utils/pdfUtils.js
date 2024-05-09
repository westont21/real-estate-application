const fs = require('fs');
const path = require('path');
const pdf = require('pdfkit');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.SERVICE_ACCOUNT_PATH,
  projectId: process.env.PROJECT_ID
});
const bucketName = process.env.CONTRACT_PDF_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

async function createFilledContractPDF(templateContent, placeholders) {
  let filledTemplate = templateContent;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filledTemplate = filledTemplate.replace(regex, value);
  }

  const doc = new pdf();
  doc.text(filledTemplate, { align: 'left' });
  doc.end();

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}

async function uploadToGoogleCloud(pdfBuffer) {
  const fileName = `contract-${Date.now()}.pdf`;
  const file = bucket.file(`contracts/${fileName}`);

  // Create a writable stream to pipe the PDF buffer
  const stream = file.createWriteStream({
    metadata: {
      contentType: 'application/pdf' // Set the content type of the file
    }
  });

  // Handle stream events
  stream.on('error', (err) => {
    console.error('Error uploading PDF to Google Cloud Storage:', err);
    throw err;
  });

  // Pipe the PDF buffer to the writable stream
  stream.end(pdfBuffer);

  // Get the signed URL with a one-hour expiration
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  const [url] = await file.getSignedUrl(options);
  return url;
}


module.exports = {
  createFilledContractPDF,
  uploadToGoogleCloud
};
