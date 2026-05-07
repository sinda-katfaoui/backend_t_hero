const axios = require("axios");

/**
 * Strict urban-only keywords.
 * Generic words like "furniture", "wall", "building", "outdoor",
 * "wire", "plastic", "bottle" are intentionally excluded —
 * they match desks, faces, food, and other irrelevant images.
 */
const URBAN_KEYWORDS = [
  // Road / voirie — outdoor road infrastructure only
  "road", "street", "highway", "pothole", "asphalt", "pavement",
  "tarmac", "sidewalk", "curb", "footpath", "road surface",
  "road damage", "broken road", "road crack", "road hole",
  "route", "trottoir", "chaussee", "asphalte", "nid de poule",

  // Waste / propreté — outdoor waste only
  "waste", "garbage", "trash", "litter", "rubbish",
  "dump", "landfill", "sewage", "refuse",
  "overflowing bin", "street waste", "littering", "dumping",
  "dechet", "poubelle", "ordure",

  // Lighting — street infrastructure only
  "street light", "street lamp", "lamp post", "light pole",
  "broken light", "unlit street", "dark street",
  "lampadaire", "eclairage public",

  // Infrastructure — outdoor/public only
  "manhole", "storm drain", "drainage",
  "graffiti", "vandalism", "broken sidewalk", "cracked pavement",
  "road sign", "traffic sign", "guardrail",
  "broken fence", "collapsed wall", "sinkhole",

  // Danger — outdoor emergency situations only
  "flood", "flooding", "inondation",
  "fire", "incendie",
  "collapsed", "effondrement",
  "fallen tree", "blocked road", "road hazard",
  "exposed wire", "broken pipe",

  // Outdoor urban scene — strict, no generic words
  "urban street", "public road", "city street",
  "neighbourhood", "neighborhood",
];

/**
 * Checks if Vision API labels contain at least one urban keyword.
 * Only considers labels with confidence >= 0.60 to avoid
 * low-confidence false positives.
 *
 * [FIX] Only checks label.includes(keyword) — NEVER keyword.includes(label)
 * The previous bug: keyword.includes(label) caused:
 *   "road surface".includes("face") → true  (face photo accepted as voirie)
 *   "neighbourhood".includes("hood") → true (random match)
 * The fix: the LABEL must contain the keyword, not the other way around.
 *
 * @param {Array} labels - [{ label: string, confidence: number }]
 * @returns {{ relevant: boolean, matchedLabel: string|null }}
 */
function checkImageRelevance(labels) {
  const confidentLabels = labels.filter(l => l.confidence >= 0.60);

  console.log("[VisionService] Checking relevance for labels:",
    confidentLabels.map(l => `${l.label}(${l.confidence})`));

  for (const { label } of confidentLabels) {
    for (const keyword of URBAN_KEYWORDS) {
      // [FIX] label must contain the keyword — never check keyword.includes(label)
      if (label === keyword || label.includes(keyword)) {
        console.log(`[VisionService] Urban match: "${label}" contains keyword "${keyword}"`);
        return { relevant: true, matchedLabel: label };
      }
    }
  }

  console.log("[VisionService] No urban match — image rejected");
  return { relevant: false, matchedLabel: null };
}

/**
 * Analyses an image via Google Cloud Vision API.
 * Returns normalized labels: [{ label: string, confidence: number }]
 *
 * @param {string} base64Image - Image encoded in base64
 * @returns {Array} [{ label: string, confidence: number }]
 */
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