const PDFDocument = require('pdfkit');
const { Storage } = require('@google-cloud/storage');
const { Readable } = require('stream');
require('dotenv').config();

const storage = new Storage({
  keyFilename: process.env.CONTRACT_SERVICE_ACCOUNT_PATH,
  projectId: process.env.PROJECT_ID
});
const bucket = storage.bucket(process.env.CONTRACT_PDF_BUCKET_NAME);

async function createFilledContractPDF(templateContent, placeholders) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    let content = templateContent;
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    doc.text(content);
    doc.end();
  });
}

async function uploadToGoogleCloud(pdfBuffer, userId) {
  const fileName = `contracts/${userId}/${Date.now()}.pdf`;
  const file = bucket.file(fileName);

  const stream = Readable.from(pdfBuffer);

  await new Promise((resolve, reject) => {
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
      },
      resumable: false,
    });

    stream.pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });

  return fileName;
}

module.exports = { createFilledContractPDF, uploadToGoogleCloud };
