const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateCategoryDescription(categoryName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a content writer. Generate a short, clear, and professional description (1-2 sentences) for a category named "${categoryName}" in a voucher/rewards platform.

Requirements:
- Explain what this category includes
- Keep it under 100 characters
- Use a friendly, professional tone
- Do NOT use markdown, quotes, or special formatting
- Return ONLY the description text, nothing else`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const description = response.text().trim();

    return description;
  } catch (error) {
    console.error("Gemini API error (category):", error);
    throw new Error("Failed to generate category description");
  }
}

async function generateVoucherDescription({ title, brand, category, points, discountAmount }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a marketing copywriter. Generate a short, catchy, and professional voucher description (2-3 sentences max) for the following voucher:

- Title: ${title}
- Brand: ${brand}
- Category: ${category || "General"}
- Points Cost: ${points} points
- Discount Amount: ${discountAmount ? `$${discountAmount} off` : "Not specified"}

Requirements:
- Make it engaging and persuasive
- Highlight the value proposition
- Keep it under 150 characters
- Use an enthusiastic but professional tone
- Do NOT use markdown, quotes, or special formatting
- Return ONLY the description text, nothing else`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const description = response.text().trim();

    return description;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate description");
  }
}

module.exports = { generateVoucherDescription, generateCategoryDescription };
