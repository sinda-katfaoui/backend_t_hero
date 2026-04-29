/**
 * ============================================================
 * FICHIER  : analyseAI.controller.js
 * RÔLE     : Logique métier complète de l'analyse intelligente
 *            des signalements par intelligence artificielle
 * RESPONSABILITÉ : Coordonner les appels à Google Vision API et
 *                  au moteur IA pour analyser textes et images,
 *                  puis persister les résultats en base de données
 * PLACE    : Couche "controllers/" — orchestrateur entre les routes,
 *            les services IA (visionService, aiEngine) et les modèles
 * FONCTIONNALITÉ : Analyse de texte par mots-clés, analyse d'image
 *                  via Google Vision API, analyse directe en Base64
 *                  depuis Flutter, consultation et suppression des
 *                  analyses avec mise à jour automatique de la priorité
 *                  du signalement concerné
 * ============================================================
 */

const { analyzeImage } = require('../services/visionService');
const { analyzeReport } = require('../services/aiEngine');
const AnalyseIA   = require('../models/analyseAI.model');
const Signalement = require('../models/signalement.model');

/* ── analyserTexte() — from diagram ── */

/**
 * Analyse textuelle d'un signalement existant par mots-clés
 * - Vérifie l'existence du signalement et l'absence d'une analyse précédente
 * - Délègue l'analyse à la fonction locale analyseTexteIA()
 * - Sauvegarde le résultat et met à jour la priorité du signalement
 */
exports.analyserTexte = async (req, res) => {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    // Empêche la création d'une deuxième analyse pour le même signalement
    const existing = await AnalyseIA.findOne({ signalement: signalementId });
    if (existing) {
      return res.status(409).json({
        message: "Une analyse existe déjà pour ce signalement",
        data:    existing
      });
    }

    // Analyse la description textuelle du signalement par mots-clés
    const resultat = analyseTexteIA(signalement.description);

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance:    resultat.scoreConfiance,
      resultatCategorie: resultat.resultatCategorie,
      resultatPriorite:  resultat.resultatPriorite,
      analyseTexte:      signalement.description
    });

    await analyse.save();

    // Met à jour le signalement avec la référence à l'analyse et la priorité détectée
    await Signalement.findByIdAndUpdate(signalementId, {
      analyseIA: analyse._id,
      priorite:  resultat.resultatPriorite
    });

    res.status(201).json({
      message: "Analyse texte effectuée avec succès",
      data:    analyse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── analyserImage() — uses Google Vision API ── */

/**
 * Analyse de l'image d'un signalement via Google Vision API
 * - Vérifie l'existence du signalement, de sa photo et l'absence d'analyse existante
 * - Envoie la photo à Google Vision API pour obtenir des labels de détection
 * - Compte les signalements dans la même zone pour ajuster la priorité
 * - Fait appel au moteur IA (aiEngine) pour calculer la priorité finale
 * - Mappe les résultats IA vers les valeurs enum du modèle
 * - Sauvegarde l'analyse et met à jour la priorité du signalement
 */
exports.analyserImage = async (req, res) => {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    if (!signalement.photo) {
      return res.status(400).json({ message: "Ce signalement n'a pas de photo à analyser" });
    }

    // Empêche la création d'une deuxième analyse pour le même signalement
    const existing = await AnalyseIA.findOne({ signalement: signalementId });
    if (existing) {
      return res.status(409).json({
        message: "Une analyse existe déjà pour ce signalement",
        data:    existing
      });
    }

    // Appel à Google Vision API — isolé pour ne pas bloquer si le service échoue
    let labels = [];
    try {
      labels = await analyzeImage(signalement.photo);
      console.log("[AnalyseAI] Google Vision labels:", labels);
    } catch (visionErr) {
      console.error("[AnalyseAI] Google Vision error:", visionErr.message);
    }

    // Compte combien de signalements existent dans la même zone géographique
    // Ce chiffre influence le calcul de la priorité dans le moteur IA
    let zoneRepetition = 0;
    if (signalement.localisation && signalement.localisation.zone) {
      zoneRepetition = await Signalement.countDocuments({
        'localisation.zone': signalement.localisation.zone
      });
    }

    // Calcule la priorité et la catégorie via la formule du moteur IA
    const aiResult = analyzeReport(labels, zoneRepetition, new Date());
    console.log("[AnalyseAI] AI Result:", aiResult);

    // Correspondance entre les catégories du moteur IA et les valeurs enum du modèle
    const categoryMap = {
      road:           'VOIRIE',
      waste:          'PROPRETE',
      lighting:       'ECLAIRAGE',
      danger:         'VOIRIE',
      infrastructure: 'ESPACES_VERTS',
      other:          'AUTRE',
    };

    // Correspondance entre les priorités du moteur IA et les valeurs enum du modèle
    const priorityMap = {
      critical: 'ELEVEE',
      high:     'ELEVEE',
      medium:   'MOYENNE',
      low:      'FAIBLE',
    };

    const resultatCategorie = categoryMap[aiResult.category]  || 'AUTRE';
    const resultatPriorite  = priorityMap[aiResult.priority]  || 'FAIBLE';
    const scoreConfiance    = aiResult.confidence;

    const analyse = new AnalyseIA({
      signalement:       signalementId,
      scoreConfiance,
      resultatCategorie,
      resultatPriorite,
      analyseImage:      signalement.photo,
      // Stocke les métadonnées IA supplémentaires dans le champ analyseTexte pour référence
      analyseTexte:      JSON.stringify({
        labels:    labels.slice(0, 5),
        score:     aiResult.score,
        isNight:   aiResult.isNight,
        category:  aiResult.category,
        priority:  aiResult.priority,
      })
    });

    await analyse.save();

    // Met à jour le signalement avec la référence à l'analyse et la priorité calculée
    await Signalement.findByIdAndUpdate(signalementId, {
      analyseIA: analyse._id,
      priorite:  resultatPriorite
    });

    res.status(201).json({
      message: "Analyse image effectuée avec succès (Google Vision API)",
      data:    analyse,
      ai: {
        category:   aiResult.category,
        priority:   aiResult.priority,
        score:      aiResult.score,
        confidence: aiResult.confidence,
        labels:     labels.slice(0, 5),
      }
    });
  } catch (error) {
    console.error("[AnalyseAI] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ── analyzeSignalement() — called directly with Base64 image from Flutter ── */

/**
 * Analyse directe d'une image envoyée en Base64 depuis l'application Flutter
 * - Accepte une image encodée en Base64 sans nécessiter un signalement existant
 * - Nettoie le préfixe Base64 (data:image/...) avant traitement
 * - Appelle Google Vision API pour la détection de labels
 * - Calcule la priorité et la catégorie via le moteur IA
 * - Si un signalementId est fourni, lie l'analyse au signalement et met à jour sa priorité
 */
exports.analyzeSignalement = async (req, res) => {
  try {
    const { image, signalementId, zone } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "image (Base64) is required." });
    }

    // Supprime le préfixe MIME du Base64 pour obtenir les données brutes
    const base64 = image.replace(/^data:image\/\w+;base64,/, "");

    // Appel à Google Vision API — isolé pour ne pas bloquer si le service échoue
    let labels = [];
    try {
      labels = await analyzeImage(base64);
      console.log("[AnalyseAI] Google Vision labels:", labels);
    } catch (visionErr) {
      console.error("[AnalyseAI] Vision error:", visionErr.message);
    }

    // Compte les signalements dans la même zone si fournie (influence la priorité)
    let zoneRepetition = 0;
    if (zone) {
      zoneRepetition = await Signalement.countDocuments({ zone });
    }

    // Calcule la priorité et la catégorie via la formule du moteur IA
    const aiResult = analyzeReport(labels, zoneRepetition, new Date());

    // Correspondance entre les catégories du moteur IA et les valeurs enum du modèle
    const categoryMap = {
      road:           'VOIRIE',
      waste:          'PROPRETE',
      lighting:       'ECLAIRAGE',
      danger:         'VOIRIE',
      infrastructure: 'ESPACES_VERTS',
      other:          'AUTRE',
    };

    // Correspondance entre les priorités du moteur IA et les valeurs enum du modèle
    const priorityMap = {
      critical: 'ELEVEE',
      high:     'ELEVEE',
      medium:   'MOYENNE',
      low:      'FAIBLE',
    };

    const analyseDoc = await AnalyseIA.create({
      signalement:       signalementId || null,
      scoreConfiance:    aiResult.confidence,
      resultatCategorie: categoryMap[aiResult.category] || 'AUTRE',
      resultatPriorite:  priorityMap[aiResult.priority] || 'FAIBLE',
      // Stocke uniquement les 100 premiers caractères du Base64 (pas l'image complète)
      analyseImage:      base64.substring(0, 100),
      analyseTexte:      JSON.stringify({
        labels:   labels.slice(0, 5),
        score:    aiResult.score,
        isNight:  aiResult.isNight,
        category: aiResult.category,
        priority: aiResult.priority,
      }),
    });

    // Lie l'analyse au signalement et met à jour sa priorité si un ID est fourni
    if (signalementId) {
      await Signalement.findByIdAndUpdate(signalementId, {
        analyseIA: analyseDoc._id,
        priorite:  priorityMap[aiResult.priority] || 'FAIBLE',
      });
    }

    return res.status(201).json({
      success:   true,
      analyseId: analyseDoc._id,
      ai: {
        category:   aiResult.category,
        priority:   aiResult.priority,
        score:      aiResult.score,
        confidence: aiResult.confidence,
        isNight:    aiResult.isNight,
        labels:     labels.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("[AnalyseAI Controller] Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ── getAnalyseBySignalement() ── */

/**
 * Récupération de l'analyse liée à un signalement spécifique
 * - Peuple les informations du signalement (description, statut, priorité, photo)
 * - Retourne 404 si aucune analyse n'existe pour ce signalement
 */
exports.getAnalyseBySignalement = async (req, res) => {
  try {
    const analyse = await AnalyseIA.findOne({ signalement: req.params.signalementId })
      .populate({
        path:   'signalement',
        select: 'description statut priorite localisation photo'
      });

    if (!analyse) {
      return res.status(404).json({ message: "Analyse non trouvée pour ce signalement" });
    }

    res.status(200).json({ data: analyse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── getAllAnalyses() — for Admin dashboard ── */

/**
 * Récupération de toutes les analyses disponibles
 * - Réservé au tableau de bord administrateur
 * - Trie par date d'analyse décroissante (les plus récentes en premier)
 * - Peuple les informations essentielles du signalement lié
 */
exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await AnalyseIA.find()
      .populate({
        path:   'signalement',
        select: 'description statut priorite localisation'
      })
      .sort({ dateAnalyse: -1 });

    res.status(200).json({ data: analyses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── deleteAnalyse() ── */

/**
 * Suppression définitive d'une analyse par son identifiant
 * - Vérifie l'existence de l'analyse avant suppression
 * - NETTOYAGE : retire la référence analyseIA du signalement lié
 *   pour maintenir l'intégrité des données (pas de référence orpheline)
 */
exports.deleteAnalyse = async (req, res) => {
  try {
    const analyse = await AnalyseIA.findById(req.params.id);
    if (!analyse) {
      return res.status(404).json({ message: "Analyse non trouvée" });
    }

    // Supprime la référence à l'analyse dans le signalement lié
    await Signalement.findByIdAndUpdate(analyse.signalement, {
      analyseIA: null
    });

    await AnalyseIA.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Analyse supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ────────────────────────────────────────────────
   AI LOGIC HELPERS
──────────────────────────────────────────────── */

/**
 * Analyse textuelle par détection de mots-clés dans la description
 * - Convertit la description en minuscules pour une comparaison insensible à la casse
 * - Détermine la catégorie, la priorité et le score de confiance
 *   selon les mots-clés détectés dans le texte
 * - Retourne des valeurs par défaut (AUTRE / FAIBLE / 0.5) si aucun mot-clé ne correspond
 */
function analyseTexteIA(description) {
  const text = description.toLowerCase();

  let resultatCategorie = 'AUTRE';
  let resultatPriorite  = 'FAIBLE';
  let scoreConfiance    = 0.5;

  if (text.includes('route') || text.includes('trottoir') || text.includes('nid')) {
    resultatCategorie = 'VOIRIE';
    resultatPriorite  = 'ELEVEE';
    scoreConfiance    = 0.80;
  } else if (text.includes('lumière') || text.includes('lampadaire') || text.includes('éclairage')) {
    resultatCategorie = 'ECLAIRAGE';
    resultatPriorite  = 'MOYENNE';
    scoreConfiance    = 0.75;
  } else if (text.includes('déchet') || text.includes('poubelle') || text.includes('propre')) {
    resultatCategorie = 'PROPRETE';
    resultatPriorite  = 'MOYENNE';
    scoreConfiance    = 0.70;
  } else if (text.includes('arbre') || text.includes('parc') || text.includes('jardin')) {
    resultatCategorie = 'ESPACES_VERTS';
    resultatPriorite  = 'FAIBLE';
    scoreConfiance    = 0.65;
  }

  return { resultatCategorie, resultatPriorite, scoreConfiance };
}

/**
 * Ancienne fonction d'analyse d'image par nom de fichier (non utilisée)
 * Remplacée par l'appel à Google Vision API via visionService.js
 * Conservée pour référence historique
 */
function analyseImageIA(photoFilename) {
  return {
    resultatCategorie: 'AUTRE',
    resultatPriorite:  'FAIBLE',
    scoreConfiance:    0.5
  };
}