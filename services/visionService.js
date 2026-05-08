const axios = require("axios");

const URBAN_KEYWORDS = [
  // Road / voirie
  "road", "street", "highway", "pothole", "asphalt", "pavement",
  "tarmac", "sidewalk", "curb", "footpath", "road surface",
  "road damage", "broken road", "road crack", "road hole",
  "route", "trottoir", "chaussee", "asphalte", "nid de poule",

  // Waste / propreté
  "waste", "garbage", "trash", "litter", "rubbish",
  "dump", "landfill", "sewage", "refuse",
  "overflowing bin", "street waste", "littering", "dumping",
  "dechet", "poubelle", "ordure",

  // Lighting — expanded to match Vision API actual labels
  "street light", "street lamp", "lamp post", "light pole",
  "broken light", "unlit street", "dark street",
  "lampadaire", "eclairage public",
  "light fixture", "lighting", "lantern", "lamp", "light bulb",
  "sconce", "street lighting", "outdoor lighting", "public lighting",
  "darkness", "night light", "electric light",

  // Infrastructure
  "manhole", "storm drain", "drainage",
  "graffiti", "vandalism", "broken sidewalk", "cracked pavement",
  "road sign", "traffic sign", "guardrail",
  "broken fence", "collapsed wall", "sinkhole",

  // Danger
  "flood", "flooding", "inondation",
  "fire", "incendie",
  "collapsed", "effondrement",
  "fallen tree", "blocked road", "road hazard",
  "exposed wire", "broken pipe",

  // Outdoor urban scene
  "urban street", "public road", "city street",
  "neighbourhood", "neighborhood",
];

function checkImageRelevance(labels) {
  const confidentLabels = labels.filter(l => l.confidence >= 0.60);

  console.log("[VisionService] Checking relevance for labels:",
    confidentLabels.map(l => `${l.label}(${l.confidence})`));

  for (const { label } of confidentLabels) {
    for (const keyword of URBAN_KEYWORDS) {
      if (label === keyword || label.includes(keyword)) {
        console.log(`[VisionService] Urban match: "${label}" contains keyword "${keyword}"`);
        return { relevant: true, matchedLabel: label };
      }
    }
  }

  console.log("[VisionService] No urban match — image rejected");
  return { relevant: false, matchedLabel: null };
}

async function analyzeImage(base64Image) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY is not set in .env");

  console.log("[VisionService] Sending image to Google Cloud Vision API...");

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      requests: [
        {
          image:    { content: base64Image },
          features: [{ type: "LABEL_DETECTION", maxResults: 10 }],
        },
      ],
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    }
  );

  const annotations = response.data?.responses?.[0]?.labelAnnotations || [];

  if (annotations.length === 0) {
    console.warn("[VisionService] No labels returned from Vision API");
    return [];
  }

  const labels = annotations.map(item => ({
    label:      item.description.toLowerCase(),
    confidence: Math.round(item.score * 10000) / 10000,
  }));

  console.log("[VisionService] Labels received:", labels);
  return labels;
}

module.exports = { analyzeImage, checkImageRelevance };