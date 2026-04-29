/**
 * @file visionService.js
 * @description Service d'analyse d'images par intelligence artificielle visuelle.
 * @responsibility Envoyer une image encodée en base64 à l'API Google Cloud Vision
 *                 et retourner les labels détectés dans un format exploitable
 *                 par le moteur de classification aiEngine.js.
 * @architecture Situé dans services/, il constitue la première étape du pipeline IA :
 *               visionService (détection) → aiEngine (classification + priorité)
 *               → analyseAI.controller (persistance + réponse API).
 * @fonctionnalité Appel HTTP à Google Cloud Vision API (LABEL_DETECTION),
 *                 normalisation des résultats, gestion du timeout et des erreurs.
 */

const axios = require("axios");

/**
 * Analyse une image via l'API Google Cloud Vision et retourne les labels détectés.
 * Utilise la fonctionnalité LABEL_DETECTION pour identifier les objets,
 * scènes et concepts présents dans l'image du signalement.
 *
 * @param {string} base64Image - Image encodée en base64 (envoyée par le client mobile)
 * @returns {Array} Liste de labels normalisés : [{ label: string, confidence: number }]
 *                  Retourne un tableau vide si aucun label n'est détecté.
 * @throws {Error} Si la clé API Google Vision n'est pas définie dans le fichier .env
 */
async function analyzeImage(base64Image) {

  /* ── Vérification de la clé API ──
     La clé est obligatoire — l'absence de GOOGLE_VISION_API_KEY bloque immédiatement
     l'exécution pour éviter un appel HTTP voué à l'échec */
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY is not set in .env");

  console.log("[VisionService] Sending image to Google Cloud Vision API...");

  /* ── Appel à l'API Google Cloud Vision ──
     Envoi de l'image en base64 avec la fonctionnalité LABEL_DETECTION.
     maxResults: 10 — on récupère les 10 labels les plus pertinents détectés.
     timeout: 15000ms — abandon de la requête après 15 secondes sans réponse. */
  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      requests: [
        {
          image: { content: base64Image }, // Image transmise en base64
          features: [
            { type: "LABEL_DETECTION", maxResults: 10 } // Type d'analyse demandé à l'API
          ]
        }
      ]
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000 // Timeout de sécurité pour éviter les requêtes bloquées
    }
  );

  /* ── Extraction des annotations retournées par l'API ──
     Accès sécurisé via l'opérateur ?. — retourne un tableau vide si la réponse est vide */
  const annotations = response.data?.responses?.[0]?.labelAnnotations || [];

  /* Aucun label détecté dans l'image — retour d'un tableau vide sans erreur */
  if (annotations.length === 0) {
    console.warn("[VisionService] No labels returned from Vision API");
    return [];
  }

  /* ── Normalisation des résultats au format attendu par aiEngine.js ──
     Transformation de la réponse brute Google Vision vers { label, confidence } :
     - description : texte du label converti en minuscules pour la comparaison de mots-clés
     - score       : confiance arrondie à 4 décimales pour la cohérence avec aiEngine */
  const labels = annotations.map(item => ({
    label:      item.description.toLowerCase(),              // Ex: "pothole", "garbage", "road"
    confidence: Math.round(item.score * 10000) / 10000      // Ex: 0.9423, 0.7851
  }));

  console.log("[VisionService] Labels received:", labels);
  return labels;
}

module.exports = { analyzeImage };