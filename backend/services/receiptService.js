const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generateReceiptPDF = async (orderData, user) => {
  try {
    const receiptsDir = path.join(__dirname, "..", "uploads", "receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const html = generateReceiptHTML(orderData, user);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    // Use networkidle0 to ensure any external styles/fonts (if added) are loaded
    await page.setContent(html, { waitUntil: "networkidle0" });

    const filename = `receipt-${orderData.orderNumber}-${Date.now()}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    await page.pdf({
      path: filepath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm", // Content has its own padding
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

const generateReceiptHTML = (orderData, user) => {
  const { items, orderNumber, totalPoints, timestamp } = orderData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    :root {
      --primary: #4f46e5;
      --slate-900: #0f172a;
      --slate-600: #475569;
      --slate-400: #94a3b8;
      --slate-100: #f1f5f9;
      --white: #ffffff;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      background: var(--white);
      color: var(--slate-900);
      line-height: 1.5;
      padding: 60px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 60px;
    }

    .brand-section h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: -0.025em;
      margin-bottom: 4px;
    }

    .brand-section p {
      color: var(--slate-400);
      font-size: 14px;
    }

    .status-badge {
      background: #ecfdf5;
      color: #059669;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin-bottom: 60px;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--slate-100);
    }

    .meta-item label {
      display: block;
      color: var(--slate-400);
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .meta-item p {
      font-size: 14px;
      font-weight: 600;
      color: var(--slate-900);
    }

    .table-container {
      margin-bottom: 40px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      color: var(--slate-400);
      font-size: 12px;
      text-transform: uppercase;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--slate-100);
    }

    td {
      padding: 24px 0;
      border-bottom: 1px solid var(--slate-100);
      vertical-align: top;
    }

    .item-name {
      font-weight: 600;
      color: var(--slate-900);
      font-size: 15px;
    }

    .item-subtext {
      color: var(--slate-400);
      font-size: 13px;
      margin-top: 4px;
    }

    .text-right { text-align: right; }

    .summary-wrapper {
      display: flex;
      justify-content: flex-end;
    }

    .summary-card {
      width: 300px;
      background: var(--slate-100);
      border-radius: 16px;
      padding: 24px;
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
      border-top: 1px solid var(--slate-400);
      font-weight: 700;
      font-size: 18px;
      color: var(--primary);
    }

    .footer {
      margin-top: 80px;
      text-align: center;
    }

    .footer p {
      color: var(--slate-400);
      font-size: 12px;
      margin-bottom: 8px;
    }

    .note-box {
      background: #f5f3ff;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      border-left: 4px solid var(--primary);
    }

    .note-box p {
      color: var(--primary);
      font-size: 13px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-section">
      <h1>VoucherHub.</h1>
      <p>Official Redemption Receipt</p>
    </div>
    <div class="status-badge">Payment Successful</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <label>Billed To</label>
      <p>${user.fullName || user.username}</p>
      <p style="font-weight: 400; color: var(--slate-600)">${user.email}</p>
    </div>
    <div class="meta-item">
      <label>Order Details</label>
      <p>#${orderNumber}</p>
      <p style="font-weight: 400; color: var(--slate-600)">${new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
    <div class="meta-item">
      <label>Payment Method</label>
      <p>Reward Points</p>
      <p style="font-weight: 400; color: var(--slate-600)">Internal Wallet</p>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              <div class="item-name">${item.voucher.title}</div>
              <div class="item-subtext">${item.voucher.brand} • ${item.voucher.category?.name || "General"}</div>
            </td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.voucher.points?.toLocaleString()} pts</td>
            <td class="text-right" style="font-weight: 600;">${(item.voucher.points * item.quantity).toLocaleString()} pts</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <div class="summary-wrapper">
    <div class="summary-card">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${totalPoints.toLocaleString()} pts</span>
      </div>
      <div class="summary-row">
        <span>Processing Fee</span>
        <span>0 pts</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${totalPoints.toLocaleString()} pts</span>
      </div>
    </div>
  </div>

  <div class="note-box">
    <p>💡 Your voucher codes have been dispatched to your registered email address and are ready for use in your "My Vouchers" section.</p>
  </div>

  <div class="footer">
    <p>Thank you for choosing VoucherHub.</p>
    <p style="color: var(--slate-400)">If you have any questions, please contact support@voucherhub.com</p>
    <p style="margin-top: 20px; font-size: 10px; color: var(--slate-400)">Generated automatically on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
};

module.exports = { generateReceiptPDF };