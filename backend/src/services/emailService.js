const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@kanban-collab.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Kanban Collab';
  }

  /**
   * Send email notification for card assignment
   */
  async sendCardAssignmentEmail(assigneeEmail, assigneeName, cardTitle, boardTitle, assignedBy) {
    try {
      const msg = {
        to: assigneeEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `🎯 New Card Assignment: ${cardTitle}`,
        html: this.getCardAssignmentTemplate(assigneeName, cardTitle, boardTitle, assignedBy),
        text: `Hi ${assigneeName}, you have been assigned to the card "${cardTitle}" in board "${boardTitle}" by ${assignedBy}.`
      };

      await sgMail.send(msg);
      console.log(`📧 Card assignment email sent to ${assigneeEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send card assignment email:', error);
      return false;
    }
  }

  /**
   * Send email notification for @mention
   */
  async sendMentionEmail(mentionedEmail, mentionedName, cardTitle, boardTitle, mentionedBy, comment) {
    try {
      const msg = {
        to: mentionedEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `💬 You were mentioned in: ${cardTitle}`,
        html: this.getMentionTemplate(mentionedName, cardTitle, boardTitle, mentionedBy, comment),
        text: `Hi ${mentionedName}, you were mentioned in a comment on card "${cardTitle}" in board "${boardTitle}" by ${mentionedBy}.`
      };

      await sgMail.send(msg);
      console.log(`📧 Mention email sent to ${mentionedEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send mention email:', error);
      return false;
    }
  }

  /**
   * Send email notification for board invitation
   */
  async sendBoardInvitationEmail(inviteeEmail, inviteeName, boardTitle, inviterName, role) {
    try {
      const msg = {
        to: inviteeEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `📋 You've been invited to board: ${boardTitle}`,
        html: this.getBoardInvitationTemplate(inviteeName, boardTitle, inviterName, role),
        text: `Hi ${inviteeName}, you have been invited to join the board "${boardTitle}" as ${role} by ${inviterName}.`
      };

      await sgMail.send(msg);
      console.log(`📧 Board invitation email sent to ${inviteeEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send board invitation email:', error);
      return false;
    }
  }

  /**
   * Send email notification for card due date reminder
   */
  async sendDueDateReminderEmail(assigneeEmail, assigneeName, cardTitle, boardTitle, dueDate) {
    try {
      const msg = {
        to: assigneeEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `⏰ Due Date Reminder: ${cardTitle}`,
        html: this.getDueDateReminderTemplate(assigneeName, cardTitle, boardTitle, dueDate),
        text: `Hi ${assigneeName}, this is a reminder that the card "${cardTitle}" in board "${boardTitle}" is due on ${dueDate}.`
      };

      await sgMail.send(msg);
      console.log(`📧 Due date reminder email sent to ${assigneeEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send due date reminder email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userEmail, firstName, lastName) {
    try {
      const msg = {
        to: userEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `🎉 Welcome to Kanban Collab!`,
        html: this.getWelcomeTemplate(firstName, lastName, userEmail),
        text: `Hi ${firstName}, welcome to Kanban Collab! Your account has been successfully created.`
      };

      await sgMail.send(msg);
      console.log(`📧 Welcome email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, firstName, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const msg = {
        to: userEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `🔐 Reset Your Password - Kanban Collab`,
        html: this.getPasswordResetTemplate(firstName, resetUrl),
        text: `Hi ${firstName}, you requested to reset your password. Click this link to reset: ${resetUrl}`
      };

      await sgMail.send(msg);
      console.log(`📧 Password reset email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send login notification email for security
   */
  async sendLoginNotificationEmail(userEmail, firstName, loginInfo) {
    try {
      const msg = {
        to: userEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `🔒 New Login Detected - Kanban Collab`,
        html: this.getLoginNotificationTemplate(firstName, loginInfo),
        text: `Hi ${firstName}, we detected a new login to your Kanban Collab account.`
      };

      await sgMail.send(msg);
      console.log(`📧 Login notification email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send login notification email:', error);
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(userEmail, firstName, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const msg = {
        to: userEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `📧 Verify Your Email - Kanban Collab`,
        html: this.getEmailVerificationTemplate(firstName, verificationUrl),
        text: `Hi ${firstName}, please verify your email by clicking this link: ${verificationUrl}`
      };

      await sgMail.send(msg);
      console.log(`📧 Email verification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email verification:', error);
      return false;
    }
  }

  // Email Templates
  getCardAssignmentTemplate(assigneeName, cardTitle, boardTitle, assignedBy) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Card Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .card-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Card Assignment</h1>
          </div>
          <div class="content">
            <h2>Hi ${assigneeName}!</h2>
            <p>You have been assigned to a new card in your Kanban board.</p>
            
            <div class="card-info">
              <h3>📋 Card Details</h3>
              <p><strong>Card Title:</strong> ${cardTitle}</p>
              <p><strong>Board:</strong> ${boardTitle}</p>
              <p><strong>Assigned by:</strong> ${assignedBy}</p>
            </div>
            
            <p>Click the button below to view the card and start working on it:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View Card</a>
            
            <p>Happy collaborating! 🚀</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you have any questions, please contact your team administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getMentionTemplate(mentionedName, cardTitle, boardTitle, mentionedBy, comment) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You were mentioned</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .comment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 You were mentioned</h1>
          </div>
          <div class="content">
            <h2>Hi ${mentionedName}!</h2>
            <p>You were mentioned in a comment on a card in your Kanban board.</p>
            
            <div class="comment-box">
              <h3>📋 Card Details</h3>
              <p><strong>Card Title:</strong> ${cardTitle}</p>
              <p><strong>Board:</strong> ${boardTitle}</p>
              <p><strong>Mentioned by:</strong> ${mentionedBy}</p>
              <p><strong>Comment:</strong></p>
              <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic;">"${comment}"</p>
            </div>
            
            <p>Click the button below to view the card and respond:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View Card</a>
            
            <p>Keep the conversation going! 💬</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you have any questions, please contact your team administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getBoardInvitationTemplate(inviteeName, boardTitle, inviterName, role) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Board Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .invitation-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Board Invitation</h1>
          </div>
          <div class="content">
            <h2>Hi ${inviteeName}!</h2>
            <p>You have been invited to join a Kanban board.</p>
            
            <div class="invitation-info">
              <h3>🎯 Invitation Details</h3>
              <p><strong>Board:</strong> ${boardTitle}</p>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>Invited by:</strong> ${inviterName}</p>
            </div>
            
            <p>Click the button below to accept the invitation and start collaborating:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Join Board</a>
            
            <p>Welcome to the team! 🎉</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you have any questions, please contact your team administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDueDateReminderTemplate(assigneeName, cardTitle, boardTitle, dueDate) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Due Date Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .reminder-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Due Date Reminder</h1>
          </div>
          <div class="content">
            <h2>Hi ${assigneeName}!</h2>
            <p>This is a friendly reminder about an upcoming due date.</p>
            
            <div class="reminder-info">
              <h3>📋 Card Details</h3>
              <p><strong>Card Title:</strong> ${cardTitle}</p>
              <p><strong>Board:</strong> ${boardTitle}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p>Click the button below to view the card and update its status:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View Card</a>
            
            <p>Don't forget to update the card status! ⏰</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you have any questions, please contact your team administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(firstName, lastName, userEmail) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Kanban Collab</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .account-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Kanban Collab!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>Welcome to Kanban Collab! Your account has been successfully created and you're ready to start collaborating.</p>
            
            <div class="account-info">
              <h3>📋 Account Details</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Click the button below to get started and create your first board:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Get Started</a>
            
            <p>Happy collaborating! 🚀</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(firstName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF5722; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning-box { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF5722; }
          .button { display: inline-block; background: #FF5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>We received a request to reset your password for your Kanban Collab account.</p>
            
            <div class="warning-box">
              <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. For security, this link expires in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getLoginNotificationTemplate(firstName, loginInfo) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Detected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .login-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3; }
          .security-alert { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 New Login Detected</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>We detected a new login to your Kanban Collab account.</p>
            
            <div class="login-info">
              <h3>📋 Login Details</h3>
              <p><strong>Time:</strong> ${loginInfo.time || new Date().toLocaleString()}</p>
              <p><strong>IP Address:</strong> ${loginInfo.ipAddress || 'Unknown'}</p>
              <p><strong>Location:</strong> ${loginInfo.location || 'Unknown'}</p>
              <p><strong>Device:</strong> ${loginInfo.device || 'Unknown'}</p>
            </div>
            
            <div class="security-alert">
              <p><strong>⚠️ Security Alert:</strong> If this wasn't you, please change your password immediately and contact support.</p>
            </div>
            
            <p>Click the button below to view your account settings:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">View Account</a>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you have security concerns, please contact support immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(firstName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Kanban Collab</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .verification-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>Thank you for signing up for Kanban Collab! To complete your registration, please verify your email address.</p>
            
            <div class="verification-info">
              <h3>🔐 Email Verification Required</h3>
              <p>Click the button below to verify your email address and activate your account:</p>
            </div>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationUrl}</p>
            
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
            
            <p>Welcome to Kanban Collab! 🚀</p>
          </div>
          <div class="footer">
            <p>This email was sent from Kanban Collab. If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
