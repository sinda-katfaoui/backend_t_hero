/**
 * @file aiEngine.js
 * @description Moteur d'intelligence artificielle pour l'analyse et la priorisation des signalements.
 * @responsibility Classifier automatiquement un signalement dans une catégorie de problème urbain,
 *                 puis calculer un score de priorité en fonction de plusieurs critères pondérés.
 * @architecture Situé dans services/, il est appelé par le controller analyseAI
 *               après que visionService ait extrait les labels depuis l'image.
 * @fonctionnalité Classification par mots-clés multilingues (FR/EN), calcul de score
 *                 de priorité pondéré, détection automatique des signalements nocturnes.
 */

/* ─────────────────────────────────────────
   DICTIONNAIRE DE CLASSIFICATION
   ───────────────────────────────────────── */

/**
 * Dictionnaire des catégories de problèmes urbains reconnus par le moteur IA.
 * Chaque catégorie contient :
 *  - keywords : liste de mots-clés en français et en anglais pour la détection
 *  - base     : score de priorité de base (sur 10) propre à la gravité de la catégorie
 *
 * Priorités de base par catégorie :
 *  - danger         : 9 (urgence maximale)
 *  - road           : 8 (voirie dégradée)
 *  - lighting       : 7 (sécurité nocturne)
 *  - waste          : 6 (salubrité publique)
 *  - infrastructure : 5 (mobilier urbain)
 */
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
    base: 8, // Priorité de base élevée — impact direct sur la sécurité routière
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
    base: 6, // Priorité modérée — problème de salubrité publique
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
    base: 7, // Priorité haute — risque sécuritaire notamment la nuit
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
    base: 5, // Priorité standard — dégradation du mobilier urbain
  },
  danger: {
    keywords: [
      "danger", "hazard", "broken", "collapsed", "flood",
      "fire", "accident", "obstacle", "barrier", "explosion",
      "unsafe", "risk", "emergency", "flooding",
      "inondation", "incendie", "effondrement",
    ],
    base: 9, // Priorité maximale — situation d'urgence ou de danger immédiat
  },
};

/* Catégorie et score par défaut si aucun mot-clé ne correspond */
const DEFAULT_CATEGORY = "other";
const DEFAULT_BASE = 4;

/* ─────────────────────────────────────────
   CLASSIFICATION DU PROBLÈME
   ───────────────────────────────────────── */

/**
 * Classifie un signalement dans une catégorie de problème urbain
 * en comparant les labels extraits par l'IA visuelle aux mots-clés de chaque catégorie.
 * Retient la catégorie dont le label correspondant a la plus haute confiance.
 *
 * @param {Array} labels - Liste d'objets { label: string, confidence: number }
 *                         retournés par visionService (Google Vision API)
 * @returns {Object} { category, basePriority, confidence }
 */
function classifyProblem(labels) {
  /* Initialisation avec les valeurs par défaut */
  let bestCategory   = DEFAULT_CATEGORY;
  let bestBase       = DEFAULT_BASE;
  let bestConfidence = 0;

  /* Parcours de toutes les catégories et de tous les labels détectés */
  for (const [categoryName, def] of Object.entries(CATEGORIES)) {
    for (const { label, confidence } of labels) {

      /* Correspondance bidirectionnelle : le label contient le mot-clé OU le mot-clé contient le label */
      const matched = def.keywords.some(
        (kw) => label.includes(kw) || kw.includes(label)
      );

      /* On ne retient que la correspondance avec la plus haute confiance */
      if (matched && confidence > bestConfidence) {
        bestCategory   = categoryName;
        bestBase       = def.base;
        bestConfidence = confidence;
      }
    }
  }

  /* Si aucun mot-clé ne correspond, on utilise la confiance du premier label
     pour ne pas retourner un score nul */
  if (bestConfidence === 0 && labels.length > 0) {
    bestConfidence = labels[0].confidence;
  }

  return { category: bestCategory, basePriority: bestBase, confidence: bestConfidence };
}

/* ─────────────────────────────────────────
   CALCUL DU SCORE DE PRIORITÉ
   ───────────────────────────────────────── */

/**
 * Calcule un score de priorité pondéré entre 0 et 1 à partir de 4 critères.
 *
 * Formule de pondération :
 *  - Priorité de base de la catégorie : 50% du score (critère dominant)
 *  - Confiance de l'IA visuelle        : 30% du score
 *  - Répétition dans la même zone      : 10% du score (problème récurrent)
 *  - Signalement nocturne              : 10% du score (risque aggravé la nuit)
 *
 * Seuils de classification finale :
 *  - score >= 0.75 → "critical"
 *  - score >= 0.55 → "high"
 *  - score >= 0.35 → "medium"
 *  - score <  0.35 → "low"
 *
 * @param {Object} params
 * @param {number}  params.basePriority    - Priorité de base de la catégorie (0–10)
 * @param {number}  params.confidence      - Confiance de la détection IA (0–1)
 * @param {number}  params.zoneRepetition  - Nombre de signalements similaires dans la zone
 * @param {boolean} params.isNight         - true si le signalement est nocturne (20h–6h)
 * @returns {Object} { score, priority }
 */
function calculatePriorityScore({ basePriority, confidence, zoneRepetition, isNight }) {
  /* Normalisation de la priorité de base sur une échelle 0–1 */
  const normBase   = basePriority / 10;

  /* Plafonnement de la répétition à 10 puis normalisation sur 0–1 */
  const normZone   = Math.min(zoneRepetition, 10) / 10;

  /* Bonus binaire pour les signalements nocturnes (plus dangereux) */
  const nightBonus = isNight ? 1 : 0;

  /* Calcul du score final par combinaison pondérée des 4 critères */
  const score =
    normBase    * 0.50 +   // Gravité intrinsèque de la catégorie
    confidence  * 0.30 +   // Fiabilité de la détection IA
    normZone    * 0.10 +   // Récurrence du problème dans la zone
    nightBonus  * 0.10;    // Aggravation nocturne

  /* Arrondi à 4 décimales pour la lisibilité */
  const roundedScore = Math.round(score * 10000) / 10000;

  /* Détermination du niveau de priorité textuel selon les seuils définis */
  let priority;
  if (roundedScore >= 0.75)      priority = "critical";
  else if (roundedScore >= 0.55) priority = "high";
  else if (roundedScore >= 0.35) priority = "medium";
  else                            priority = "low";

  return { score: roundedScore, priority };
}

/* ─────────────────────────────────────────
   FONCTION PRINCIPALE D'ANALYSE
   ───────────────────────────────────────── */

/**
 * Fonction principale du moteur IA — orchestre la classification et le calcul de priorité.
 * Appelée par le controller analyseAI après réception des labels de Google Vision.
 * Détecte automatiquement si le signalement a été effectué de nuit (entre 20h et 6h).
 *
 * @param {Array}  labels          - Labels détectés par visionService { label, confidence }
 * @param {number} zoneRepetition  - Nombre de signalements similaires dans la même zone (défaut: 0)
 * @param {Date}   reportedAt      - Date et heure du signalement (défaut: maintenant)
 * @returns {Object} Résultat complet de l'analyse :
 *                   { category, basePriority, confidence, score, priority, isNight }
 */
function analyzeReport(labels, zoneRepetition = 0, reportedAt = new Date()) {

  /* Étape 1 : Classification du signalement par mots-clés */
  const { category, basePriority, confidence } = classifyProblem(labels);

  /* Étape 2 : Détection nocturne — signalement entre 20h et 6h du matin */
  const hour    = new Date(reportedAt).getHours();
  const isNight = hour >= 20 || hour < 6;

  /* Étape 3 : Calcul du score de priorité pondéré */
  const { score, priority } = calculatePriorityScore({
    basePriority,
    confidence,
    zoneRepetition,
    isNight,
  });

  /* Retour du résultat complet de l'analyse pour persistance en base de données */
  return {
    category,
    basePriority,
    confidence: Math.round(confidence * 10000) / 10000, // Arrondi à 4 décimales
    score,
    priority,
    isNight,
  };
}

module.exports = { analyzeReport, classifyProblem, calculatePriorityScore };