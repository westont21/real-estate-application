const mongoose = require('mongoose');
const ContractTemplate = require('../models/ContractTemplate');
require('dotenv').config({ path: "../../.env" });

const templates = [
  {
    name: 'Realtor-Buyer Agreement',
    description: 'Agreement between Realtor and Buyer outlining commission structure, timing, and flexible payment terms.',
    content: `
      REALTOR-BUYER AGREEMENT

      This Agreement is made on {{date}} between {{realtor_name}}, with address {{realtor_address}}, and {{buyer_name}}, with address {{buyer_address}}.

      1. **Commission:** The parties agree to a {{commission_type}} commission, either {{commission_rate}}% or a flat rate of {{flat_rate}} USD.

      2. **Timing:** The agreement remains valid from {{start_date}} to {{end_date}}.

      3. **Flexible Payment:** If the transaction is completed within {{timeframe}}, a reduced commission of {{reduced_rate}}% will apply.

      4. **e-Signatures:** This contract is considered valid when signed by the authorized representatives:
      - Party 1: ______________________ Date: {{sign_date}}
      - Party 2: ______________________ Date: {{sign_date}}
    `
  },
  {
    name: 'Custom Agreement',
    description: 'Custom agreement with custom terms, dates, and signatures.',
    content: `

      {{custom_terms}}

      Signatures:
      - Party 1: ______________________ Date: {{sign_date}}
      - Party 2: ______________________ Date: {{sign_date}}
    `
  }
];

async function populateTemplates() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await ContractTemplate.insertMany(templates);
    console.log('Templates populated successfully');
  } catch (err) {
    console.error('Error populating templates:', err);
  } finally {
    mongoose.connection.close();
  }
}

populateTemplates();
