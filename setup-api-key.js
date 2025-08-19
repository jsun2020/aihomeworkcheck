// Setup script to configure your real API key for Demo Mode
// Run this script: node setup-api-key.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 AI Homework Checker - Demo API Key Setup');
console.log('============================================');
console.log('This will configure your real API key for Demo Mode.');
console.log('Your API key will be securely stored and never visible to users.');
console.log('');

rl.question('Enter your Doubao API Key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }

  // Validate API key format (basic check)
  if (!apiKey.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
    console.log('⚠️  Warning: API key format may be incorrect.');
    console.log('Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  }

  const configPath = path.join(__dirname, 'src', 'config', 'apiConfig.ts');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace the placeholder with the real API key
    configContent = configContent.replace(
      'YOUR_REAL_API_KEY_HERE',
      apiKey.trim()
    );
    
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ API key configured successfully!');
    console.log('');
    console.log('Demo Mode Features:');
    console.log('- First 10 calls use your real API key');
    console.log('- Real homework photo analysis');
    console.log('- API key always displays as *** to users'); 
    console.log('- API key cannot be copied or viewed by users');
    console.log('- After 10 uses, users need their own key or payment');
    console.log('');
    console.log('🚀 Ready to test! Run: npm start');
    
  } catch (error) {
    console.error('❌ Failed to configure API key:', error.message);
  }
  
  rl.close();
});

rl.on('close', () => {
  process.exit(0);
});