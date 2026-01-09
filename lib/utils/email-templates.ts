/**
 * Email templates for authentication-related emails
 */

interface PasswordResetEmailData {
  userEmail: string;
  resetLink: string;
  expirationTime?: string;
}

/**
 * Generate HTML template for password reset email
 */
export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const { userEmail, resetLink, expirationTime = '1 hour' } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - SuperContact</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #5479EE;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #5479EE;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-top: 30px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SuperContact</div>
        <p>Sales Management Platform</p>
      </div>
      
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your SuperContact account associated with <strong>${userEmail}</strong>.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        
        <div class="warning">
          <strong>Important:</strong> This link will expire in ${expirationTime}. If you didn't request this password reset, please ignore this email.
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #5479EE;">${resetLink}</p>
      </div>
      
      <div class="footer">
        <p>This email was sent by SuperContact. If you have any questions, please contact our support team.</p>
        <p>&copy; ${new Date().getFullYear()} SuperContact. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text template for password reset email
 */
export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  const { userEmail, resetLink, expirationTime = '1 hour' } = data;
  
  return `
SuperContact - Reset Your Password

Hello,

We received a request to reset the password for your SuperContact account associated with ${userEmail}.

Please click the following link to reset your password:
${resetLink}

IMPORTANT: This link will expire in ${expirationTime}. If you didn't request this password reset, please ignore this email.

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} SuperContact. All rights reserved.
  `.trim();
}

/**
 * Email subject lines
 */
export const EMAIL_SUBJECTS = {
  PASSWORD_RESET: 'Reset Your SuperContact Password',
  PASSWORD_RESET_SUCCESS: 'Your SuperContact Password Has Been Reset',
  ACCOUNT_VERIFICATION: 'Verify Your SuperContact Account',
} as const;