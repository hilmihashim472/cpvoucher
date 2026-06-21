const transporter = require("../config/email");

const sendReceiptEmail = async (user, orderData, pdfPath) => {
  try {
    const { orderNumber } = orderData;

    const mailOptions = {
      from: `"VoucherHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Confirmation: Your redemption #${orderNumber} is complete`,
      html: generateEmailHTML(orderData, user),
      attachments: [
        {
          filename: `receipt-${orderNumber}.pdf`,
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

const generateEmailHTML = (orderData, user) => {
  const { orderNumber, items, totalPoints, timestamp } = orderData;

  // Use system fonts for best compatibility across devices
  const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ${fontStack};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: left;">
              <h1 style="margin: 0; color: #4f46e5; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">VoucherHub.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a;">Redemption Confirmed</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">
                Hi ${user.fullName || user.username},<br>
                Great news! Your voucher redemption has been processed successfully. We've attached your official receipt to this email.
              </p>

              <!-- Order Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; padding-bottom: 8px;">Order Number</td>
                        <td align="right" style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; padding-bottom: 8px;">Date</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #0f172a; font-weight: 600;">#${orderNumber}</td>
                        <td align="right" style="font-size: 14px; color: #0f172a; font-weight: 600;">${new Date(timestamp).toLocaleDateString()}</td>
                      </tr>
                    </table>

                    <div style="margin: 20px 0; border-top: 1px solid #e2e8f0;"></div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${items.map(item => `
                        <tr>
                          <td style="padding: 8px 0;">
                            <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${item.voucher.title}</div>
                            <div style="font-size: 12px; color: #64748b;">Qty: ${item.quantity}</div>
                          </td>
                          <td align="right" style="font-size: 14px; font-weight: 600; color: #0f172a;">
                            ${(item.voucher.points * item.quantity).toLocaleString()} pts
                          </td>
                        </tr>
                      `).join('')}
                      <tr>
                        <td style="padding-top: 20px; font-size: 16px; font-weight: 700; color: #4f46e5;">Total Used</td>
                        <td align="right" style="padding-top: 20px; font-size: 16px; font-weight: 700; color: #4f46e5;">
                          ${totalPoints.toLocaleString()} pts
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action/Note Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
                      <strong>Next Steps:</strong> Your unique voucher codes will be sent in a separate email shortly. You can also view them anytime in your account under "My Vouchers."
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Text -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9;">
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                Voucher codes expire 24 hours after redemption if unused.<br>
                If you didn't authorize this redemption, please contact our security team immediately.
              </p>
            </td>
          </tr>
        </table>

        <!-- Social/Company Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; padding-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} VoucherHub Inc. All rights reserved.<br>
              123 Rewards Ave, Digital City, 54321
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