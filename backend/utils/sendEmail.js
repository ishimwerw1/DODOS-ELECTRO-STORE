import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Basic validation of env variables
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-actual-email')) {
      console.error('CRITICAL: EMAIL_USER is not configured correctly in .env');
      throw new Error('Email credentials not configured in .env file');
    }

    console.log(`DEBUG: SMTP Config - User: ${process.env.EMAIL_USER}, Pass Length: ${process.env.EMAIL_PASS?.length || 0}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,
      socketTimeout: 15000
    });

    console.log(`Attempting to send email to ${options.email} using ${process.env.EMAIL_USER}...`);
    
    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Transporter Verification Failed:', verifyError.message);
      throw new Error(`SMTP Verification Failed: ${verifyError.message}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `DODOS ELECTRO STORE <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email successfully sent! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    throw error; // Re-throw to be handled by the controller
  }
};

export default sendEmail;
