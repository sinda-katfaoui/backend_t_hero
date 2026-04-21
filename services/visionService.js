const axios = require("axios");

const VISION_PROMPT = `Analyze this urban problem photo for T HERO Smart City Tunisia.
Return ONLY a JSON array of 3 labels maximum. No markdown, no text, no explanation.
Use these exact labels based on what you see:
- Garbage/trash/waste/bins → "waste"
- Pothole/crack/road damage → "pothole"  
- Broken light/lamp post → "lamp"
- Graffiti/broken bench/park → "graffiti"
- Flood/fire/collapse → "danger"

Example: [{"label":"waste","confidence":0.97},{"label":"garbage","confidence":0.95},{"label":"trash","confidence":0.90}]
ONLY return the JSON array:`;

async function analyzeImage(base64Image) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

  // Only use gemini-2.5-flash — the only one that works for this account
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];

  const requestBody = {
    contents: [{
      parts: [
        { inline_data: { mime_type: "image/jpeg", data: base64Image } },
        { text: VISION_PROMPT }
      ]
    }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 200 }
  };

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`[VisionService] Trying: ${model}`);

      const response = await axios.post(url, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 20000
      });

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(`[VisionService] Raw: "${rawText}"`);

      if (!rawText || rawText.trim().length < 10) {
        console.log(`[VisionService] Empty response from ${model}, trying next...`);
        continue;
      }

      let cleanText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Extract JSON array from anywhere in the text
      const match = cleanText.match(/\[[\s\S]*\]/);
      if (match) cleanText = match[0];
      else {
        if (!cleanText.startsWith("[")) cleanText = "[" + cleanText;
        if (!cleanText.endsWith("]"))   cleanText = cleanText + "]";
      }

      let labels = [];
      try {
        labels = JSON.parse(cleanText);
        labels = labels
          .filter(item =>
            item &&
            typeof item.label === "string" &&
            typeof item.confidence === "number")
          .map(item => ({
            label: item.label.toLowerCase(),
            confidence: Math.min(Math.max(item.confidence, 0), 1)
          }))
          .sort((a, b) => b.confidence - a.confidence);

        if (labels.length > 0) {
          console.log(`[VisionService] SUCCESS with ${model}:`, labels);
          return labels;
        }
      } catch (parseErr) {
        console.error("[VisionService] Parse error on:", cleanText);
        continue;
      }
    } catch (err) {
      const status = err.response?.status;
      console.log(`[VisionService] ${model} failed: ${status}`);
      if (status === 429) {
        console.log("[VisionService] Rate limit — waiting 8s...");
        await new Promise(r => setTimeout(r, 8000));
      }
    }
  }

  console.error("[VisionService] All models failed.");
  return [];
}

module.exports = { analyzeImage };