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
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    const lines = templateContent.split('\n');

    lines.forEach((line) => {
      let currentLine = line;

      // Handle placeholders in each line
      const match = currentLine.match(/{{(.*?)}}/g);
      if (match) {
        match.forEach((placeholder) => {
          const key = placeholder.replace(/{{|}}/g, '');
          const value = (typeof placeholders.get === 'function' ? placeholders.get(key) : placeholders[key]) || '______________________';
          
          if ((key.includes('realtor_signature') || key.includes('client_signature')) && value.startsWith('data:image/')) {
            const imgBuffer = Buffer.from(value.split(',')[1], 'base64');
            const imageWidth = 150; // Width of the signature image
            const imageHeight = 50; // Height of the signature image
            const parts = currentLine.split(placeholder);

            // Render text before the signature
            if (parts[0]) {
              doc.text(parts[0].trim(), { continued: true });
            }

            // Render the signature image
            doc.image(imgBuffer, doc.x, doc.y, { width: imageWidth, height: imageHeight });

            // Move the y position down by the height of the image to avoid overlapping
            doc.moveDown(imageHeight / 10);

            // Render text after the signature
            if (parts[1]) {
              currentLine = parts[1];
            } else {
              currentLine = '';
            }
          } else {
            currentLine = currentLine.replace(placeholder, value);
          }
        });
      }

      // Ensure placeholders are replaced before rendering
      currentLine = currentLine.replace(/{{(.*?)}}/g, (_, key) => {
        const value = (typeof placeholders.get === 'function' ? placeholders.get(key) : placeholders[key]) || '______________________';
        return value;
      });

      // Render the line with replaced placeholders
      if (currentLine) {
        doc.text(currentLine.trim(), { paragraphGap: 10, continued: false });
      }
    });

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

async function deleteFromGoogleCloud(filePath) {
  const file = bucket.file(filePath);

  await file.delete();
}

module.exports = { createFilledContractPDF, uploadToGoogleCloud, deleteFromGoogleCloud };
