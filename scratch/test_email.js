const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.error('Error: .env file not found at', envPath);
      return;
    }
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

loadEnv();

async function testGmail() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log(`Attempting connection to SMTP Server...`);
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Password length: ${pass ? pass.length : 0} chars`);

  if (!user || !pass) {
    console.error('Error: EMAIL_USER or EMAIL_PASS environment variables are missing!');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // false for 587
    auth: {
      user,
      pass,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully! Your credentials are correct.');

    console.log('Sending test email to yourself...');
    const info = await transporter.sendMail({
      from: `"LivBizz Booking" <${user}>`,
      to: user, 
      subject: 'LivBizz SMTP Test Mail',
      text: 'If you receive this, your Gmail SMTP configuration is fully working!',
    });
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Connection/Auth failed with error:');
    console.error(error.message);
    console.error(error);
  }
}

testGmail();
