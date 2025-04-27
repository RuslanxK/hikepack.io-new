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
    const hasExistingData = categories && categories.length > 0 && categories.some(cat => cat.categoryName.trim() !== "" || (cat.items && cat.items.length > 0));

    const systemPrompt = hasExistingData ? `
You are a professional mountain hiking gear expert assistant.

The user already has these categories and items packed:

${categories.map(cat => `
Category: ${cat.categoryName || "Unnamed Category"}
Items: ${(cat.items && cat.items.length > 0) ? cat.items.join(", ") : "No items"}
`).join("\n")}

Your task:
- Analyze the existing gear carefully.
- DO NOT repeat any categories or items the user already has.
- Suggest ONLY missing or alternative important categories and items crucial for professional mountain hiking.
- Focus on suggesting **different categories** if the current ones already exist.
- If the user has a lot, suggest fewer but **newer** essential categories and items.
- If the user has few categories/items, suggest more to complete a professional bag.

**For suggestions:**
- Create 4–6 new or missing important categories.
- Each category should include 10–15 new items.
- Cover only missing areas (safety, shelter, emergency, navigation, food, hydration, cold protection, etc.).

**For each item:**
- Include "qty" (Quantity) as a number (according to typical hiking needs).
- Add a short "description" (1 sentence).
- Add "priority" ("High", "Medium", "Low") depending on how critical it is.
- Add "weightOption" ("g", "kg", "oz", or "lb") matching realistic item units.
- Add "weight" (realistic average weight).

**IMPORTANT:**  
Do not suggest duplicates or near-identical items already listed.
Make sure to improve the user's bag completeness!

Return ONLY pure JSON:

[
  {
    "categoryName": "New Suggested Category",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      },
      ...
    ]
  },
  ...
]

❗ Do not explain anything. ONLY valid JSON output.
`
: `
You are a professional mountain hiking gear expert assistant.

The user has NO categories or items yet.

Your task:
- Build a FULL, complete, professional mountain hiking bag.
- Start from **basic**, move to **important**, then **unique** hiking items.
- Create at least 8–10 categories (not 5–7).
- Each category should include 12–20 items.
- Focus on real-world hiking: safety, shelter, survival, hydration, cold protection, navigation, emergency rescue, cooking, lighting, first-aid, etc.
- Cover everything needed for 3–10 day mountain hikes.

**For each item:**
- Include "qty" (Quantity) as a number (1–4 usually).
- Add a short "description" (1 simple sentence).
- Add "priority" ("High", "Medium", "Low") depending on how critical it is.
- Add "weightOption" ("g", "kg", "oz", "lb").
- Add "weight" (realistic average weight).

Return ONLY pure JSON:

[
  {
    "categoryName": "Essential Category",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      },
      ...
    ]
  },
  ...
]

❗ Return ONLY valid JSON. No explanations.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input }
      ],
      temperature: 0.5,
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
      error: error.response?.data?.error?.message || "Failed to get AI response" 
    });
  }
});

module.exports = router;
