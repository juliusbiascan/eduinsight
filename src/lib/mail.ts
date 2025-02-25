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

export const sendTeamInvitationEmail = async (
  email: string,
  role: string,
  labId: string,
  token?: string,
) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const link = token 
    ? `${domain}/auth/register?token=${token}&labId=${labId}` 
    : `${domain}/teams/accept?labId=${labId}`;

  await sendEmail({
    to: email,
    subject: "Team Invitation - EduInsight",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9121F; margin-bottom: 20px;">Join Our Team</h2>
        <p>Hello,</p>
        <p>You have been invited to join our laboratory team as a <strong>${role.toLowerCase()}</strong>.</p>
        ${token 
          ? '<p>Since you don\'t have an account yet, you\'ll need to create one to join the team.</p>' 
          : '<p>Click the button below to accept the invitation and join the team.</p>'
        }
        <div style="margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #C9121F; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    display: inline-block;">
            ${token ? 'Create Account' : 'Accept Invitation'}
          </a>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This invitation link will expire in 24 hours and can only be used once.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't expect this invitation, you can safely ignore this email.
          This link will expire in 24 hours.
        </p>
      </div>
    `
  });
};
