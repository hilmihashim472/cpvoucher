const transporter = require("../config/email");

/**
 * Sends a redemption receipt email with the generated PDF as an attachment
 * @param {Object} user - User object (email, fullName, username)
 * @param {Object} orderData - Order details (orderNumber, items, totalPoints, timestamp)
 * @param {string} pdfPath - Path to the generated PDF file
 */
const sendReceiptEmail = async (user, orderData, pdfPath) => {
  try {
    const { orderNumber } = orderData;

    const mailOptions = {
      from: `"Carter Bank Voucher" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Redemption Confirmed: #${orderNumber}`,
      html: generateEmailHTML(orderData, user),
      attachments: [
        {
          filename: `Receipt-${orderNumber}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Receipt email sent:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send receipt email");
  }
};

/**
 * Sends a password reset email to the user
 * @param {Object} user - User object (email, fullName, username)
 * @param {string} resetLink - Full reset URL with token
 */
const sendResetEmail = async (user, resetLink) => {
  try {
    const mailOptions = {
      from: `"Carter Bank Voucher" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your Carter Bank Voucher password",
      html: generateResetEmailHTML(user, resetLink),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Password reset email error:", error);
    throw new Error("Failed to send reset email");
  }
};

/**
 * Password reset email template
 */
const generateResetEmailHTML = (user, resetLink) => {
  const primaryColor = "#6366f1";
  const textColor = "#1e293b";
  const mutedColor = "#64748b";
  const bgColor = "#f8fafc";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgColor}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="color: ${primaryColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.03em;">Carter Bank Voucher</div>
            </td>
            <td align="right">
              <span style="font-size: 12px; font-weight: 600; color: #d97706; background-color: #fffbeb; padding: 4px 12px; border-radius: 99px; text-transform: uppercase;">Reset Password</span>
            </td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: ${textColor};">Reset your password.</h1>
              <p style="margin: 0; font-size: 16px; color: ${mutedColor}; line-height: 1.6;">
                Hi ${user.fullName || user.username}, we received a request to reset your Carter Bank Voucher account password. Click the button below to set a new one. This link expires in <strong>15 minutes</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: ${primaryColor}; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.01em;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 0 40px;">
              <div style="border-top: 1px solid #f1f5f9;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 40px 40px;">
              <p style="margin: 0; font-size: 13px; color: ${mutedColor}; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. Your password won't change unless you click the button above.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: ${mutedColor}; line-height: 1.6;">
                Button not working? Copy this link into your browser:<br>
                <a href="${resetLink}" style="color: ${primaryColor}; word-break: break-all; font-size: 12px;">${resetLink}</a>
              </p>
            </td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; padding-top: 30px;">
          <tr>
            <td align="center" style="font-size: 12px; color: ${mutedColor}; line-height: 1.8;">
              &copy; ${new Date().getFullYear()} Carter Bank Berhad. All rights reserved.<br>
              5th Floor, Surian Tower, Jln PJU 7/3, Mutiara Damansara, Petaling Jaya, Selangor 47810<br>
              <a href="#" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">Support Center</a> &nbsp;&bull;&nbsp; <a href="#" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">Privacy Policy</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Modern SaaS-style Email Template
 * Designed for maximum compatibility (Gmail, Outlook, Apple Mail)
 */
const generateEmailHTML = (orderData, user) => {
  const { orderNumber, items, totalPoints, timestamp } = orderData;
  const date = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const primaryColor = "#6366f1";
  const textColor = "#1e293b";
  const mutedColor = "#64748b";
  const bgColor = "#f8fafc";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Redemption is Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgColor}; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Email Header -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="color: ${primaryColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.03em;">Carter Bank Voucher</div>
            </td>
            <td align="right">
              <span style="font-size: 12px; font-weight: 600; color: #059669; background-color: #ecfdf5; padding: 4px 12px; border-radius: 99px; text-transform: uppercase;">Confirmed</span>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Hero Section -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: ${textColor};">Redemption Successful.</h1>
              <p style="margin: 0; font-size: 16px; color: ${mutedColor}; line-height: 1.6;">
                Hi ${user.fullName || user.username}, your order has been processed. Your digital vouchers are attached to this email as a PDF receipt.
              </p>
            </td>
          </tr>

          <!-- Summary Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #f1f5f9; border-radius: 12px; background-color: #ffffff;">
                <tr>
                  <td style="padding: 24px;">
                    
                    <!-- Meta Info -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 11px; font-weight: 700; color: ${mutedColor}; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Order ID</td>
                        <td align="right" style="font-size: 11px; font-weight: 700; color: ${mutedColor}; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">Date</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-weight: 600; color: ${primaryColor}; font-family: 'Courier New', Courier, monospace;">#${orderNumber}</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: ${textColor};">${date}</td>
                      </tr>
                    </table>

                    <div style="margin: 20px 0; border-top: 1px solid #f1f5f9;"></div>

                    <!-- Items List -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${items.map(item => `
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="font-size: 14px; font-weight: 600; color: ${textColor};">${item.voucher.title}</div>
                            <div style="font-size: 12px; color: ${mutedColor};">Quantity: ${item.quantity}</div>
                          </td>
                          <td align="right" style="font-size: 14px; font-weight: 600; color: ${textColor};">
                            ${(item.voucher.points * item.quantity).toLocaleString()} pts
                          </td>
                        </tr>
                      `).join('')}
                    </table>

                    <div style="margin: 20px 0; border-top: 2px solid ${textColor};"></div>

                    <!-- Total -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 16px; font-weight: 700; color: ${textColor};">Total Points Used</td>
                        <td align="right" style="font-size: 18px; font-weight: 800; color: ${primaryColor};">
                          ${totalPoints.toLocaleString()}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA / Next Steps -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f3ff; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: ${primaryColor}; font-weight: 600;">
                      Your unique codes are also available in "My Vouchers" on our platform.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border-radius: 12px; border: 1px solid #fecaca;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #dc2626; font-weight: 600; line-height: 1.5;">
                      ⏰ Expiry Reminder: Your voucher codes will expire <span style="text-decoration: underline; text-decoration-color: #dc2626;">24 hours</span> after redemption. Use them before they're gone!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; padding-top: 30px;">
          <tr>
            <td align="center" style="font-size: 12px; color: ${mutedColor}; line-height: 1.8;">
              &copy; ${new Date().getFullYear()} Carter Bank Berhad. All rights reserved.<br>
              5th Floor, Surian Tower, Jln PJU 7/3, Mutiara Damansara, Petaling Jaya, Selangor 47810<br>
              <a href="#" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">Support Center</a> &nbsp;&bull;&nbsp; <a href="#" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">Privacy Policy</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = { sendReceiptEmail, sendResetEmail };
