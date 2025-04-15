import nodemailer from "nodemailer";

// Email data interface
export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email service
export class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string = "RecCollection <noreply@reccollection.com>";

  constructor() {
    // Get email configuration from environment variables
    const host = process.env.EMAIL_HOST || "smtp.example.com";
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const user = process.env.EMAIL_USER || "user@example.com";
    const pass = process.env.EMAIL_PASS || "password";
    this.defaultFrom =
      process.env.EMAIL_FROM || "RecCollection <noreply@reccollection.com>";

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  // Verify email connection
  private async verifyConnection(): Promise<void> {
    try {
      if (process.env.NODE_ENV !== "test") {
        await this.transporter.verify();
        console.log("Email service is ready");
      }
    } catch (error) {
      console.error("Email service verification failed:", error);
      // Don't throw, just log the error
    }
  }

  // Send email
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Validate email data
      if (!data.to || !data.subject || !data.text) {
        console.warn("Invalid email data:", data);
        return false;
      }

      // Send email
      const info = await this.transporter.sendMail({
        from: data.from || this.defaultFrom,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html || data.text,
        replyTo: data.replyTo,
        attachments: data.attachments,
      });

      console.log("Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      // In development or test, don't throw an error
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        console.log("Email would have been sent in production:", data);
        return true;
      }

      // In production, log the error but don't throw
      console.error("Failed to send email in production:", error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const subject = "Welcome to RecCollection!";
    const text = `
      Hi ${username},

      Welcome to RecCollection! We're excited to have you join our community of recipe enthusiasts.

      With RecCollection, you can:
      - Create and store your favorite recipes
      - Import recipes from social media platforms
      - Share recipes with friends and family
      - Discover new recipes from other users

      Get started by creating your first recipe or importing one from your favorite social media platform.

      Happy cooking!
      The RecCollection Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to RecCollection!</h1>
        <p>Hi ${username},</p>
        <p>Welcome to RecCollection! We're excited to have you join our community of recipe enthusiasts.</p>
        <p>With RecCollection, you can:</p>
        <ul>
          <li>Create and store your favorite recipes</li>
          <li>Import recipes from social media platforms</li>
          <li>Share recipes with friends and family</li>
          <li>Discover new recipes from other users</li>
        </ul>
        <p>Get started by creating your first recipe or importing one from your favorite social media platform.</p>
        <p>Happy cooking!</p>
        <p>The RecCollection Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  }

  // Send password reset email
  async sendPasswordResetEmail(
    to: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    const subject = "Reset Your RecCollection Password";
    const text = `
      You requested a password reset for your RecCollection account.

      Please click the link below to reset your password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request this, please ignore this email.

      The RecCollection Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Reset Your Password</h1>
        <p>You requested a password reset for your RecCollection account.</p>
        <p>Please click the button below to reset your password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>The RecCollection Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  }

  // Send recipe shared email
  async sendRecipeSharedEmail(
    to: string,
    senderName: string,
    recipeName: string,
    recipeUrl: string,
    message?: string
  ): Promise<boolean> {
    const subject = `${senderName} shared a recipe with you: ${recipeName}`;

    const text = `
      Hi there,

      ${senderName} shared a recipe with you: ${recipeName}

      ${message ? `Message from ${senderName}: ${message}` : ""}

      View the recipe here: ${recipeUrl}

      Enjoy cooking!
      The RecCollection Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Recipe Shared With You</h1>
        <p>Hi there,</p>
        <p><strong>${senderName}</strong> shared a recipe with you: <strong>${recipeName}</strong></p>

        ${
          message
            ? `<p>Message from ${senderName}:</p><blockquote style="border-left: 3px solid #4F46E5; padding-left: 15px; margin-left: 0;">${message}</blockquote>`
            : ""
        }

        <p style="text-align: center; margin: 30px 0;">
          <a href="${recipeUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Recipe</a>
        </p>

        <p>Enjoy cooking!</p>
        <p>The RecCollection Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  }
}
