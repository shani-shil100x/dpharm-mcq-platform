const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USERNAME || 'test_user',
      pass: process.env.EMAIL_PASSWORD || 'test_pass',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'D.Pharm MCQ Platform <noreply@dpharm-mcq.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    // For development/testing: log the raw URL so the user can click it in the terminal
    // even if they don't have a real email service set up yet.
    if (process.env.NODE_ENV !== 'production' || !process.env.EMAIL_HOST) {
       console.log('\n--- DEVELOPMENT MODE ---');
       console.log(`Password Reset Link: ${options.message.match(/https?:\/\/[^\s]+/)[0]}`);
       console.log('------------------------\n');
    }
  } catch (err) {
    console.error('Error sending email:', err.message);
    throw new Error('Email could not be sent. Please check your SMTP configuration.');
  }
};

module.exports = sendEmail;
