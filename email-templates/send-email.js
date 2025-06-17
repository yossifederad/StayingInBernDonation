const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Email template variables
const templateVariables = {
  name: '',
  id: '',
  amount: '',
  payment_type: '',
  date: '',
  message: ''
};

// Read the email template
const templatePath = path.join(__dirname, 'confirmation-email.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf8');

// Function to replace template variables
function replaceTemplateVariables(template, variables) {
  let result = template;
  
  // Replace simple variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  // Handle conditional blocks
  if (variables.payment_type === 'deposit') {
    result = result.replace(/{% if payment_type == 'deposit' %}([\s\S]*?){% else %}([\s\S]*?){% endif %}/g, '$1');
  } else {
    result = result.replace(/{% if payment_type == 'deposit' %}([\s\S]*?){% else %}([\s\S]*?){% endif %}/g, '$2');
  }
  
  // Handle message conditional
  if (variables.message) {
    result = result.replace(/{% if message %}([\s\S]*?){% endif %}/g, '$1');
  } else {
    result = result.replace(/{% if message %}([\s\S]*?){% endif %}/g, '');
  }
  
  return result;
}

// Function to get user input
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function to collect data and generate email
async function generateEmail() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('📧 Staying in Bern - Email Generator\n');
  console.log('Fill in the details below to generate a confirmation email:\n');

  // Collect information
  templateVariables.name = await askQuestion(rl, 'Donor Name: ');
  templateVariables.id = await askQuestion(rl, 'Transaction ID: ');
  templateVariables.amount = await askQuestion(rl, 'Amount (CHF): ');
  
  const paymentType = await askQuestion(rl, 'Payment Type (donation/deposit): ');
  templateVariables.payment_type = paymentType.toLowerCase();
  
  templateVariables.date = await askQuestion(rl, 'Date (or press Enter for current date): ') || 
    new Date().toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  
  templateVariables.message = await askQuestion(rl, 'Message (optional): ');

  rl.close();

  // Generate the email
  const emailContent = replaceTemplateVariables(emailTemplate, templateVariables);
  
  // Save to file
  const outputPath = path.join(__dirname, `email-${templateVariables.id}-${Date.now()}.html`);
  fs.writeFileSync(outputPath, emailContent);
  
  console.log('\n✅ Email generated successfully!');
  console.log(`📁 File saved: ${outputPath}`);
  console.log('\n📋 Next steps:');
  console.log('1. Open the HTML file in your browser');
  console.log('2. Copy the content or use browser print to PDF');
  console.log('3. Send manually from your email client');
  console.log('\n📧 Email details:');
  console.log(`   To: ${templateVariables.name} (you'll need their email)`);
  console.log(`   Subject: Thank you for your ${templateVariables.payment_type} - Staying in Bern`);
  console.log(`   Transaction: #${templateVariables.id}`);
  console.log(`   Amount: ${templateVariables.amount} CHF`);
}

// Run the script
if (require.main === module) {
  generateEmail().catch(console.error);
}

module.exports = { generateEmail, replaceTemplateVariables }; 