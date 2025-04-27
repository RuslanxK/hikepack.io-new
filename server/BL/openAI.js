const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.API_AI_KEY,
});

router.post("/ai", async (req, res) => {
  const { input, bagId, categories } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  try {
    const hasExistingData = categories && categories.length > 0 && categories.some(cat => cat.categoryName?.trim() !== "" || (cat.items && cat.items.length > 0));

    const systemPrompt = hasExistingData
      ? `
You are a professional mountain hiking gear expert assistant.

Analyze this packed gear JSON array:

${JSON.stringify(categories)}

Your task:
- Do NOT repeat existing categories or items.
- Suggest ONLY missing important categories and items.
- DO NOT suggest backpacks or bags (the user already has one).
- Suggest 4–6 new essential categories.
- Each category: 10–15 unique missing items (cover safety, shelter, hydration, food, navigation, emergency, cold protection).

For each item:
- "qty": number (usually 1-4)
- "description": short, clear sentence
- "priority": "High", "Medium", or "Low"
- "weightOption": "g", "kg", "oz", or "lb"
- "weight": realistic number (like 300g)

Return ONLY valid pure JSON, like:

[
  {
    "categoryName": "Category Name",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      }
    ]
  }
]

❗ Strictly return ONLY JSON without any explanations.
`
      : `
You are a professional mountain hiking gear expert assistant.

The user has no gear yet, except they already have a backpack.

Your task:
- Build a full hiking gear list from basic to professional.
- DO NOT suggest backpacks or bags (the user already has one).
- Suggest 8–10 important categories.
- Each category: 12–20 critical hiking items.

For each item:
- "qty": number (usually 1–4)
- "description": short, simple sentence
- "priority": "High", "Medium", or "Low"
- "weightOption": "g", "kg", "oz", or "lb"
- "weight": realistic average number

Return ONLY pure JSON formatted like:

[
  {
    "categoryName": "Category Name",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      }
    ]
  }
]

❗ ONLY return valid JSON. No extra text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input }
      ],
      temperature: 0.3,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      return res.status(500).json({ error: "No message returned from OpenAI" });
    }

    try {
      const parsed = JSON.parse(message);
      return res.status(200).json({ suggestion: parsed });
    } catch (jsonError) {
      console.error("Failed to parse AI response as JSON:", message);
      return res.status(500).json({ error: "AI response was not valid JSON." });
    }
  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error?.message || "Failed to get AI response",
    });
  }
});

module.exports = router;
