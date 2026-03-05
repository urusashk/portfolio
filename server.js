const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  console.log('📧 Email sending request received at:', new Date().toISOString());
  console.log('📧 Request body:', req.body);
  
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    console.log('✅ Input validation passed');

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'urusashk9@gmail.com',
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">New Contact Form Submission</h2>
          <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3>Message:</h3>
            <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Sent from Portfolio Contact Form</p>
        </div>
      `,
      replyTo: email
    };

    console.log('📤 Attempting to send email...');
    console.log('📤 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    console.log('📧 Email config check:', {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);

    res.json({
      success: true,
      message: 'Email sent successfully!'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('❌ Full error:', error);
    
    // Check for specific Gmail/SMTP errors
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed - check your App Password');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ Connection failed - check your internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timed out - Gmail SMTP may be slow');
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      error: error.message,
      stack: error.stack  // 👈 add this

    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📧 Email service ready!');
});
