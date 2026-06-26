const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

/**
 * Generates a PDF receipt using Puppeteer
 * @param {Object} orderData - The order details (items, orderNumber, totalPoints, timestamp)
 * @param {Object} user - The user details (fullName, username, email)
 */
const generateReceiptPDF = async (orderData, user) => {
  try {
    const receiptsDir = path.join(__dirname, "..", "uploads", "receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const html = generateReceiptHTML(orderData, user);

    const browser = await puppeteer.launch({
    executablePath: "/snap/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

    const page = await browser.newPage();
    
    // Set content and wait for fonts/styles to load
    await page.setContent(html, { waitUntil: "networkidle0" });

    const filename = `receipt-${orderData.orderNumber}-${Date.now()}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    await page.pdf({
      path: filepath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm", 
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    await browser.close();

    return {
      filename,
      filepath,
      url: `/uploads/receipts/${filename}`,
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate receipt PDF");
  }
};

/**
 * Modern SaaS-style HTML Template
 */
const generateReceiptHTML = (orderData, user) => {
  const { items, orderNumber, totalPoints, timestamp } = orderData;
  const date = new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

    :root {
      --brand: #6366f1;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --bg-soft: #f8fafc;
      --border: #e2e8f0;
      --success-bg: #f0fdf4;
      --success-text: #166534;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      color: var(--text-main);
      background: white;
      line-height: 1.5;
      padding: 60px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 40px;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 35px;
      height: 35px;
      background: var(--brand);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 20px;
    }

    .logo-text {
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.03em;
    }

    .receipt-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: var(--bg-soft);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 20px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 30px;
      margin-bottom: 60px;
    }

    .label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }

    .value {
      font-size: 14px;
      font-weight: 600;
    }

    .sub-value {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 400;
    }

    /* Table Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    th {
      text-align: left;
      padding: 12px 0;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 2px solid var(--text-main);
    }

    td {
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    .item-title {
      font-weight: 700;
      font-size: 15px;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .item-desc {
      font-size: 13px;
      color: var(--text-muted);
    }

    .code-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      background: #eef2ff;
      color: var(--brand);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #e0e7ff;
    }

    /* Summary */
    .summary-wrapper {
      display: flex;
      justify-content: flex-end;
    }

    .summary-box {
      width: 280px;
      background: var(--bg-soft);
      padding: 24px;
      border-radius: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .summary-row.total {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-weight: 800;
      font-size: 20px;
      color: var(--brand);
    }

    /* Footer Note */
    .note-section {
      margin-top: 60px;
      padding: 24px;
      border-radius: 12px;
      background: var(--success-bg);
      border-left: 4px solid var(--success-text);
    }

    .note-section h4 {
      font-size: 14px;
      color: var(--success-text);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .note-section p {
      font-size: 13px;
      color: var(--success-text);
      opacity: 0.8;
    }

    .footer {
      margin-top: 80px;
      text-align: center;
      border-top: 1px solid var(--border);
      padding-top: 30px;
    }

    .footer p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .stamp {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 15px;
      opacity: 0.5;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo-area">
      <div class="logo-icon">V</div>
      <span class="logo-text">Carter Bank Voucher</span>
    </div>
    <div class="receipt-badge">Invoice ID: #${orderNumber}</div>
  </div>

  <div class="info-grid">
    <div>
      <span class="label">Customer</span>
      <div class="value">${user.fullName || user.username}</div>
      <div class="sub-value">${user.email}</div>
    </div>
    <div>
      <span class="label">Date</span>
      <div class="value">${date}</div>
      <div class="sub-value">Payment: Points</div>
    </div>
    <div>
      <span class="label">Status</span>
      <div class="value" style="color: #059669;">Confirmed</div>
      <div class="sub-value">Direct Redemption</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Product Details</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Points</th>
        <th style="text-align: right;">Voucher Code</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <div class="item-title">${item.voucher.title}</div>
            <div class="item-desc">${item.voucher.brand} &bull; ${item.voucher.category?.name || "Standard"}</div>
          </td>
          <td style="text-align: center;" class="value">${item.quantity}</td>
          <td style="text-align: right;" class="value">${(item.voucher.points * item.quantity).toLocaleString()}</td>
          <td style="text-align: right;">
            <span class="code-pill">${item.voucher.code}</span>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="summary-wrapper">
    <div class="summary-box">
      <div class="summary-row">
        <span class="label" style="margin:0;">Subtotal</span>
        <span class="value">${totalPoints.toLocaleString()} pts</span>
      </div>
      <div class="summary-row">
        <span class="label" style="margin:0;">Processing</span>
        <span class="value">0 pts</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${totalPoints.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div class="note-section">
    <h4>✔ Digital Assets Delivered</h4>
    <p>Your unique voucher codes are active and ready for use. You can access these anytime under your account's "My Vouchers" section. Treat these codes as cash.</p>
  </div>

  <div class="footer">
    <p>Thank you for your business. For support, please contact admin at mukhrizbusiness@gmail.com</p>
    <div class="stamp">
      GEN_REF: ${Math.random().toString(36).substring(2, 15).toUpperCase()} | 
      PROCESSED_AT: ${new Date().toISOString()}
    </div>
  </div>

</body>
</html>
  `;
};

module.exports = { generateReceiptPDF };