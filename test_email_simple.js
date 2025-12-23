// Simple email test script
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('🔧 Testing Gmail SMTP Configuration...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'managementtime04@gmail.com',
      pass: 'sarxoodfrrxbbfuk' // App password
    },
    debug: true,
    logger: true
  });

  try {
    // Verify connection
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'managementtime04@gmail.com',
      to: 'managementtime04@gmail.com',
      subject: 'Test Email from API Layer',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<h2>Test Email</h2><p>This is a test email to verify SMTP configuration.</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return { success: false, error: error.message };
  }
};

testEmail()
  .then(result => {
    console.log('📊 Final result:', result);
  })
  .catch(error => {
    console.error('💥 Test script error:', error);
  });