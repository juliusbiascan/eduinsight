const domain = process.env.NEXT_PUBLIC_APP_URL;

import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  await sendEmail({
    to: email,
    subject: "🔒 2FA Code 🔒",
    html: `<p>🚨 Your 2FA code: ${token} 🚨</p>`
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await sendEmail({
    to: email,
    subject: "🔄 Reset your password 🔄",
    html: `<p>👉 Click <a href="${resetLink}">here</a> to reset password.</p>`
  });
};

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await sendEmail({
    to: email,
    subject: "📨 Confirm your email 📨",
    html: `<p>👉 Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  });
};
