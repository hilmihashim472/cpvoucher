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
      from: `"VoucherHub" <${process.env.EMAIL_USER}>`,
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
              <div style="color: ${primaryColor}; font-size: 22px; font-weight: 800; letter-spacing: -0.03em;">VoucherHub.</div>
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
        </table>

        <!-- Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; padding-top: 30px;">
          <tr>
            <td align="center" style="font-size: 12px; color: ${mutedColor}; line-height: 1.8;">
              &copy; ${new Date().getFullYear()} VoucherHub Inc. All rights reserved.<br>
              123 Rewards Plaza, Digital Sector, San Francisco, CA 94103<br>
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

module.exports = { sendReceiptEmail };