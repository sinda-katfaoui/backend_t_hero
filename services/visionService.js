const axios = require("axios");

async function analyzeImage(base64Image) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY is not set in .env");

  console.log("[VisionService] Sending image to Google Cloud Vision API...");

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: "LABEL_DETECTION", maxResults: 10 }
          ]
        }
      ]
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    }
  );

  const annotations = response.data?.responses?.[0]?.labelAnnotations || [];

  if (annotations.length === 0) {
    console.warn("[VisionService] No labels returned from Vision API");
    return [];
  }

  // Map to the exact format aiEngine.js expects: { label, confidence }
  const labels = annotations.map(item => ({
    label:      item.description.toLowerCase(),
    confidence: Math.round(item.score * 10000) / 10000
  }));

  console.log("[VisionService] Labels received:", labels);
  return labels;
}

module.exports = { analyzeImage };