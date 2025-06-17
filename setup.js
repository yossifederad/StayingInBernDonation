const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Staying in Bern Donation Platform...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

// Create .env files if they don't exist
console.log('\n🔧 Setting up environment files...');

// Server .env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = fs.readFileSync(path.join(__dirname, 'server', 'env.example'), 'utf8');
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env (please update with your actual values)');
} else {
  console.log('✅ server/.env already exists');
}

// Client .env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = fs.readFileSync(path.join(__dirname, 'client', 'env.example'), 'utf8');
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env (please update with your actual values)');
} else {
  console.log('✅ client/.env already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the environment variables in server/.env and client/.env');
console.log('2. Add your Stripe keys (get them from https://dashboard.stripe.com/)');
console.log('3. Set a secure admin password');
console.log('4. Run the development servers: npm run dev');
console.log('\n🔗 Useful commands:');
console.log('  npm run dev          - Start both frontend and backend');
console.log('  npm run server       - Start only the backend');
console.log('  npm run client       - Start only the frontend');
console.log('  npm run build        - Build the frontend for production');
console.log('\n📧 Email template:');
console.log('  node email-templates/send-email.js  - Generate confirmation emails');
console.log('\n🌐 Access the application:');
console.log('  Frontend: http://localhost:3000');
console.log('  Backend:  http://localhost:5000');
console.log('  Admin:    http://localhost:3000/admin'); 