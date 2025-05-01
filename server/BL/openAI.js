const express = require("express");
const OpenAI = require("openai");
const User = require("../models/user");
const Bag = require("../models/bag");
const Trip = require("../models/trip");
const authMiddleware = require("../middleware/auth");
const { jsonrepair } = require("jsonrepair");
require("dotenv").config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.API_AI_KEY });

router.post("/ai", authMiddleware, async (req, res) => {
  const { input, bagId, tripId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.coins < 2) {
      return res.status(403).json({ error: "Not enough coins to use this feature" });
    }

    const [trip, bag] = await Promise.all([
      Trip.findById(tripId),
      Bag.findById(bagId),
    ]);

    if (!trip || !bag) {
      return res.status(400).json({ error: "Trip or Bag not found" });
    }

    const startDateStr = trip.startDate
      ? new Date(trip.startDate).toISOString().split("T")[0]
      : "unknown";
    const endDateStr = trip.endDate
      ? new Date(trip.endDate).toISOString().split("T")[0]
      : "unknown";

    const userNotePrompt = `
You are a professional AI assistant that generates hiking gear categories and items.

The user provided the following instruction:
"${input.trim()}"

Your task:
- ONLY suggest gear related to hiking and outdoor trip preparation.
- DO NOT suggest non-hiking categories (e.g., games, indoor activities, general gadgets).
- Return categories with gear items strictly for hiking.

✅ FORMAT:
[
  {
    "categoryName": "Category Name",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short usage description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      }
    ]
  }
]

❗ Only return the JSON array. No explanation, markdown, or extra text.
`;

    const fullSystemPrompt = `
You are an expert hiking gear planning assistant.

Your task is to suggest a **complete and personalized list** of gear, tools, food, and essentials a hiker should **pack and wear**, based on the user's trip, bag, and profile. Include must-have and often-forgotten items.

🎯 GOAL: Provide the most thoughtful, complete list so that **no important item is forgotten** — from beginner to advanced levels.

🧍 User Details:
- Gender: ${user.gender}
- Country of origin: ${user.country}
- Activity level: ${user.activityLevel}
- Distance unit preference: ${user.distance}
- Weight unit: ${user.weightOption || "g"}

🎒 Bag Info:
- Name: ${bag.name}
- Description: ${bag.description}
- Target total weight: ${bag.goal} ${user.weightOption || "g"}

🗺️ Trip Info:
- Name: ${trip.name}
- Description: ${trip.about}
- Country: ${trip.country}
- Total Distance: ${trip.distance} km
- Dates: ${startDateStr} to ${endDateStr}

✅ INSTRUCTIONS:
- Suggest **15–25 gear categories**, each with **10–20 items**
- Include **clothing, food, electronics, medical, tools, toiletries, emergency**, and **wearables**
- Include items **in the bag**, **on the person**, and **external tools**
- Include advanced gear **but also beginner essentials**
- Be practical, accurate, complete — like a true professional
- DO NOT include bags/backpacks
- DO NOT add intros, markdown, or any explanation

✅ Each item must include:
- "name": short item name
- "qty": realistic quantity (1–4)
- "description": what it’s used for
- "priority": "High", "Medium", or "Low"
- "weightOption": "g", "kg", "oz", or "lb"
- "weight": realistic average number

✅ RETURN FORMAT: JSON only. Must begin with [ and end with ]

[
  {
    "categoryName": "Category Name",
    "items": [
      {
        "name": "Item Name",
        "qty": 1,
        "description": "Short usage description",
        "priority": "High",
        "weightOption": "g",
        "weight": 300
      }
    ]
  }
]

❗ ABSOLUTELY NO other text. Just a JSON array starting with [ and ending with ].
`;

    const systemPrompt = input?.trim() ? userNotePrompt : fullSystemPrompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const message = completion.choices[0]?.message?.content;
    if (!message) {
      return res.status(500).json({ error: "No message returned from OpenAI" });
    }

    try {
      const cleaned = message.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("❌ Could not extract valid JSON array from response:", cleaned);
        return res.status(500).json({ error: "AI response did not include valid JSON." });
      }

      const repaired = jsonrepair(jsonMatch[0]);
      const parsed = JSON.parse(repaired);

      user.coins -= 2;
      await user.save();

      return res.status(200).json({ suggestion: parsed, newCoins: user.coins });
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", parseError);
      return res.status(500).json({ error: "AI response included invalid JSON structure." });
    }
  } catch (error) {
    console.error("❌ OpenAI API error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.error?.message || "Failed to get AI response",
    });
  }
});

module.exports = router;
