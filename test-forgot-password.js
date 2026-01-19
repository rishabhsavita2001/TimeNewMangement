// Test script for forgot password APIs
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'managementtime04@gmail.com',
    pass: 'sarx oodf rrxb bfuk' // App password
  }
});

// OTP Storage
const otpStorage = {};
const resetTokens = {};

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate reset token
function generateResetToken(email) {
  return `reset_${Date.now()}_${email.replace('@', '_').replace('.', '_')}`;
}

// 1. Request OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000);

    otpStorage[email] = {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    };

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send email
    const mailOptions = {
      from: '"Time Management System" <managementtime04@gmail.com>',
      to: email,
      subject: 'Password Reset - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi there,</p>
          <p>You requested to reset your password. Please use the following 4-digit verification code:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 10px;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Time Management Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);

    res.json({
      success: true,
      message: 'Verification code sent to your email address',
      expiresIn: '5 minutes',
      otpForTesting: otp
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const otpData = otpStorage[email];
    
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this email'
      });
    }

    if (Date.now() > otpData.expiresAt) {
      delete otpStorage[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      if (otpData.attempts >= 3) {
        delete otpStorage[email];
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
      });
    }

    const resetToken = generateResetToken(email);
    resetTokens[email] = {
      token: resetToken,
      expiresAt: Date.now() + (15 * 60 * 1000),
      verified: true
    };

    delete otpStorage[email];

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// 3. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const tokenData = resetTokens[email];
    
    if (!tokenData || tokenData.token !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (Date.now() > tokenData.expiresAt) {
      delete resetTokens[email];
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    delete resetTokens[email];

    // Send invitation email
    const invitationMailOptions = {
      from: '"Time Management System" <managementtime04@gmail.com>',
      to: email,
      subject: 'Password Reset Successful - Account Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Hi Jenny,</p>
          <p>Your password has been reset successfully.</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0;">🎉 You have been invited by Sheila to join</h3>
            <p style="margin: 10px 0 0 0;"><strong>[CompanyName]</strong> - our internal system used to manage working time, absences, and employee requests.</p>
          </div>

          <p>To activate your account, please click the button below and create your password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://api-layer.vercel.app" style="background: #6f42c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Activate your account
            </a>
          </div>

          <p><strong>For security reasons, this invitation link will expire in 7 days.</strong></p>
          <p>Best regards,<br><strong>Danie Alex</strong><br>Product Team - [AppName]</p>
        </div>
      `
    };

    await transporter.sendMail(invitationMailOptions);
    console.log(`Invitation email sent to ${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password',
      emailSent: true
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Forgot Password API Test Server' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log('- POST /api/auth/forgot-password');
  console.log('- POST /api/auth/verify-otp');  
  console.log('- POST /api/auth/reset-password');
  console.log('- GET /health');
});