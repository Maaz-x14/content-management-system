import { createTransporter } from '../config/email';
import { logger } from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send email using configured SMTP transporter
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@morphelabs.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
        logger.error('Failed to send email:', error);
        throw error;
    }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email: string, fullName: string): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Morphe Labs CMS</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>Welcome to Morphe Labs Content Management System! Your account has been created successfully.</p>
            <p>You can now log in to the admin panel and start managing content.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Morphe Labs. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Welcome to Morphe Labs CMS',
        html,
        text: `Hello ${fullName}, Welcome to Morphe Labs Content Management System! Your account has been created successfully.`,
    });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
    email: string,
    fullName: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .warning { color: #DC2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>We received a request to reset your password for your Morphe Labs CMS account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <p class="warning">This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Morphe Labs. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Password Reset Request - Morphe Labs CMS',
        html,
        text: `Hello ${fullName}, Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
    });
};

/**
 * Send job application notification to admin
 */
export const sendJobApplicationNotification = async (
    jobTitle: string,
    applicantName: string,
    applicantEmail: string
): Promise<void> => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@morphelabs.com';

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .info { background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Application Received</h1>
          </div>
          <div class="content">
            <p>A new application has been submitted for the following position:</p>
            <div class="info">
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Applicant Name:</strong> ${applicantName}</p>
              <p><strong>Applicant Email:</strong> ${applicantEmail}</p>
            </div>
            <p>Please log in to the admin panel to review the application.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Morphe Labs. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    await sendEmail({
        to: adminEmail,
        subject: `New Application: ${jobTitle}`,
        html,
        text: `New application received for ${jobTitle} from ${applicantName} (${applicantEmail})`,
    });
};
