const { Storage } = require('@google-cloud/storage');
const pdf = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.CONTRACT_SERVICE_ACCOUNT_PATH,
  projectId: process.env.PROJECT_ID
});
const bucket = storage.bucket(process.env.CONTRACT_PDF_BUCKET_NAME);

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

async function uploadToGoogleCloud(pdfBuffer, userId) {
  const fileName = `contracts/${userId}/${uuidv4()}.pdf`;
  const file = bucket.file(fileName);

  // Create a writable stream to pipe the PDF buffer
  const stream = file.createWriteStream({
    metadata: {
      contentType: 'application/pdf'
    }
  });

  // Handle stream events
  stream.on('error', (err) => {
    console.error('Error uploading PDF to Google Cloud Storage:', err);
    throw err;
  });

  stream.end(pdfBuffer);

  console.log('File uploaded to:', fileName); // Log the file path

  // Return the path to the file
  return fileName;
}

module.exports = {
  createFilledContractPDF,
  uploadToGoogleCloud
};