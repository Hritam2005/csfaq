import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.password,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"AI Knowledge Hub" <noreply@knowledgehub.internal>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      // Don't throw to prevent stopping the auth flow, but log it
    }
  }

  async sendVerificationEmail(email, token) {
    const url = `${env.clientUrl}/verify-email?token=${token}`;
    const subject = 'Verify your email address';
    const html = `
      <h1>Welcome to AI Knowledge Hub</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 24 hours.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, token) {
    const url = `${env.clientUrl}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  async sendSecurityAlert(email, message) {
    const subject = 'Security Alert - Action Required';
    const html = `
      <h1 style="color: red;">Security Alert</h1>
      <p>${message}</p>
      <p>If this was not you, please secure your account immediately.</p>
    `;
    await this.sendEmail(email, subject, html);
  }
}

export default new EmailService();
