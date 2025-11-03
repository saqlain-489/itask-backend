const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // ✅ Use Gmail service instead of custom host
    auth: {
      user: process.env.SMTP_USER, // your Gmail address
      pass: process.env.SMTP_PASS  // your 16-character app password
    }
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"itask" <${process.env.SMTP_USER}>`, // fallback if EMAIL_FROM missing
    to,
    subject,
    html
  });

  console.log('Email sent:', info.messageId);
  return info;
}

module.exports = { sendEmail };
