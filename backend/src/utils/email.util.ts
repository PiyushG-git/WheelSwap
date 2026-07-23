import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Core send email function
 */
export async function sendEmail(options: MailOptions): Promise<void> {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
      logger.warn(`⚠️ SMTP credentials not configured in .env. Skipped sending email: "${options.subject}" to ${options.to}`);
      return;
    }
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
      ...options,
    });
    logger.info(`📧 Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    if (env.NODE_ENV === 'development') {
      logger.warn('⚠️ Skipping email throw in development mode.');
      return;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #f9f9f9;
  border-radius: 10px;
  overflow: hidden;
`;

const headerStyle = `
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  text-align: center;
`;

const bodyStyle = `
  background: #ffffff;
  padding: 40px 30px;
  color: #333333;
  line-height: 1.6;
`;

const btnStyle = `
  display: inline-block;
  background: #f97316;
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  margin: 20px 0;
`;

const footerStyle = `
  background: #f1f1f1;
  padding: 20px;
  text-align: center;
  color: #888888;
  font-size: 12px;
`;

function emailLayout(content: string): string {
  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="color: #f97316; margin: 0; font-size: 28px; letter-spacing: 1px;">
          🚗 WheelSwap
        </h1>
        <p style="color: #94a3b8; margin: 5px 0 0;">Peer-to-Peer Vehicle Swap & Rental</p>
      </div>
      <div style="${bodyStyle}">
        ${content}
      </div>
      <div style="${footerStyle}">
        <p>© ${new Date().getFullYear()} WheelSwap. All rights reserved.</p>
        <p>If you didn't request this email, please ignore it.</p>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// Email Senders
// ─────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your WheelSwap email address',
    html: emailLayout(`
      <h2 style="color: #1a1a2e;">Welcome to WheelSwap, ${name}! 👋</h2>
      <p>Thanks for registering. Please verify your email address to get started.</p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <div style="text-align: center;">
        <a href="${verifyUrl}" style="${btnStyle}">Verify Email Address</a>
      </div>
      <p style="color: #888; font-size: 13px;">Or copy this link: ${verifyUrl}</p>
    `),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your WheelSwap password',
    html: emailLayout(`
      <h2 style="color: #1a1a2e;">Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" style="${btnStyle}">Reset Password</a>
      </div>
    `),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: '🎉 Welcome to WheelSwap!',
    html: emailLayout(`
      <h2 style="color: #1a1a2e;">Your email is verified! 🎉</h2>
      <p>Hi ${name}, welcome to <strong>WheelSwap</strong>!</p>
      <p>You're now ready to:</p>
      <ul>
        <li>Complete your <strong>KYC verification</strong></li>
        <li>List your vehicle</li>
        <li>Search for vehicles to swap or rent</li>
      </ul>
      <div style="text-align: center;">
        <a href="${env.FRONTEND_URL}/kyc" style="${btnStyle}">Complete KYC Now</a>
      </div>
    `),
  });
}

export async function sendKycStatusEmail(
  to: string,
  name: string,
  status: 'APPROVED' | 'REJECTED',
  reason?: string
): Promise<void> {
  const isApproved = status === 'APPROVED';
  await sendEmail({
    to,
    subject: `KYC Verification ${isApproved ? 'Approved ✅' : 'Rejected ❌'} — WheelSwap`,
    html: emailLayout(`
      <h2 style="color: #1a1a2e;">KYC Verification ${isApproved ? 'Approved' : 'Rejected'}</h2>
      <p>Hi ${name},</p>
      ${isApproved
        ? `<p>🎉 Your KYC documents have been <strong>verified and approved</strong>! You can now list vehicles and participate in swaps.</p>
           <div style="text-align: center;">
             <a href="${env.FRONTEND_URL}/dashboard" style="${btnStyle}">Go to Dashboard</a>
           </div>`
        : `<p>❌ Unfortunately, your KYC documents were <strong>rejected</strong>.</p>
           ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
           <p>Please re-submit your documents with clear, valid copies.</p>
           <div style="text-align: center;">
             <a href="${env.FRONTEND_URL}/kyc" style="${btnStyle}">Re-submit Documents</a>
           </div>`
      }
    `),
  });
}

export async function sendVehicleStatusEmail(
  to: string,
  name: string,
  vehicleName: string,
  status: 'ACTIVE' | 'REJECTED',
  reason?: string
): Promise<void> {
  const isApproved = status === 'ACTIVE';
  await sendEmail({
    to,
    subject: `Vehicle ${isApproved ? 'Approved ✅' : 'Rejected ❌'} — WheelSwap`,
    html: emailLayout(`
      <h2 style="color: #1a1a2e;">Vehicle ${isApproved ? 'Approved' : 'Rejected'}</h2>
      <p>Hi ${name},</p>
      ${isApproved
        ? `<p>🎉 Your vehicle <strong>${vehicleName}</strong> has been <strong>approved</strong> and is now live on WheelSwap!</p>
           <div style="text-align: center;">
             <a href="${env.FRONTEND_URL}/my-vehicles" style="${btnStyle}">View My Vehicles</a>
           </div>`
        : `<p>❌ Your vehicle <strong>${vehicleName}</strong> was <strong>rejected</strong>.</p>
           ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
           <p>Please update your vehicle details and re-submit for approval.</p>
           <div style="text-align: center;">
             <a href="${env.FRONTEND_URL}/my-vehicles" style="${btnStyle}">Update Vehicle</a>
           </div>`
      }
    `),
  });
}
