const CATEGORIES = {
  road: {
    keywords: [
      // French
      "voirie", "route", "chaussee", "trottoir", "asphalte",
      // English
      "pothole", "road", "asphalt", "pavement", "crack",
      "highway", "street", "tarmac", "road surface", "bitumen",
      "road damage", "damaged road", "road hole", "road crack",
      "gravel", "debris", "road markings", "cracks in asphalt",
      "water in pothole", "broken pavement",
    ],
    base: 8,
  },
  waste: {
    keywords: [
      // French
      "proprete", "dechet", "poubelle", "ordure", "saleté",
      // English
      "waste", "garbage", "trash", "litter", "dump",
      "rubbish", "debris", "pollution", "refuse", "sewage",
      "bin", "container", "dirt", "filth", "messy",
      "plastic", "bag", "bottles", "scattered", "pile",
      "overflowing", "uncollected", "discarded", "junk",
      "waste management", "garbage bag", "trash bag",
      "littering", "dumping", "street waste", "urban waste",
      "garbage can", "trash can", "waste bin", "dirty",
      "unclean", "contamination", "solid waste",
    ],
    base: 6,
  },
  lighting: {
    keywords: [
      // French
      "eclairage", "lampadaire", "lumiere", "lampe",
      // English
      "light", "lamp", "street light", "lantern",
      "darkness", "lamp post", "illumination", "electric light",
      "street lamp", "broken light", "flickering",
      "light pole", "light fixture", "no light",
      "dark street", "unlit", "eclairage", "lighting",
    ],
    base: 7,
  },
  infrastructure: {
    keywords: [
      // French
      "espaces", "banc", "parc", "jardin", "trottoir",
      "graffiti", "vandalisme", "cloture", "barriere",
      // English
      "sidewalk", "curb", "bench", "sign", "fence",
      "graffiti", "vandalism", "wall", "building", "manhole",
      "footpath", "infrastructure", "public space",
      "park", "garden", "playground", "broken bench",
      "damaged park", "espaces verts", "green space",
    ],
    base: 5,
  },
  danger: {
    keywords: [
      "danger", "hazard", "broken", "collapsed", "flood",
      "fire", "accident", "obstacle", "barrier", "explosion",
      "unsafe", "risk", "emergency", "flooding",
      "inondation", "incendie", "effondrement",
    ],
    base: 9,
  },
};

const DEFAULT_CATEGORY = "other";
const DEFAULT_BASE = 4;

function classifyProblem(labels) {
  let bestCategory = DEFAULT_CATEGORY;
  let bestBase = DEFAULT_BASE;
  let bestConfidence = 0;

  for (const [categoryName, def] of Object.entries(CATEGORIES)) {
    for (const { label, confidence } of labels) {
      const matched = def.keywords.some(
        (kw) => label.includes(kw) || kw.includes(label)
      );
      if (matched && confidence > bestConfidence) {
        bestCategory = categoryName;
        bestBase = def.base;
        bestConfidence = confidence;
      }
    }
  }

  if (bestConfidence === 0 && labels.length > 0) {
    bestConfidence = labels[0].confidence;
  }

  return { category: bestCategory, basePriority: bestBase, confidence: bestConfidence };
}

function calculatePriorityScore({ basePriority, confidence, zoneRepetition, isNight }) {
  const normBase   = basePriority / 10;
  const normZone   = Math.min(zoneRepetition, 10) / 10;
  const nightBonus = isNight ? 1 : 0;

  const score =
    normBase    * 0.50 +
    confidence  * 0.30 +
    normZone    * 0.10 +
    nightBonus  * 0.10;

  const roundedScore = Math.round(score * 10000) / 10000;

  let priority;
  if (roundedScore >= 0.75)      priority = "critical";
  else if (roundedScore >= 0.55) priority = "high";
  else if (roundedScore >= 0.35) priority = "medium";
  else                            priority = "low";

  return { score: roundedScore, priority };
}

function analyzeReport(labels, zoneRepetition = 0, reportedAt = new Date()) {
  const { category, basePriority, confidence } = classifyProblem(labels);

  const hour = new Date(reportedAt).getHours();
  const isNight = hour >= 20 || hour < 6;

  const { score, priority } = calculatePriorityScore({
    basePriority,
    confidence,
    zoneRepetition,
    isNight,
  });

  return {
    category,
    basePriority,
    confidence: Math.round(confidence * 10000) / 10000,
    score,
    priority,
    isNight,
  };
}

module.exports = { analyzeReport, classifyProblem, calculatePriorityScore };