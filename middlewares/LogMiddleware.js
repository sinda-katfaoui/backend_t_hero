/**
 * @file LogMiddleware.js
 * @description Middleware de journalisation des requêtes HTTP.
 * @responsibility Enregistrer automatiquement dans un fichier de log chaque requête
 *                 traitée par l'API, avec ses métadonnées essentielles (méthode, URL,
 *                 statut, temps d'exécution), tout en garantissant la confidentialité
 *                 des données sensibles.
 * @architecture Situé dans middlewares/, il est branché globalement dans app.js
 *               et s'exécute sur chaque requête entrante avant les controllers.
 * @fonctionnalité Création automatique du fichier de log, sanitisation des données
 *                 sensibles, écriture asynchrone dans /logs/doc.log.
 */

const fs   = require("fs");
const path = require("path");

/* ─────────────────────────────────────────
   INITIALISATION DU FICHIER DE LOG
   ───────────────────────────────────────── */

/* Chemin absolu vers le dossier /logs situé à la racine du projet */
const logsDirectory = path.join(__dirname, "../logs");

/* Chemin complet vers le fichier de log doc.log */
const logFilePath   = path.join(logsDirectory, "doc.log");

/* Création automatique du dossier /logs s'il n'existe pas encore sur le système */
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

/* Création automatique du fichier doc.log vide s'il n'existe pas encore */
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
}

/* ─────────────────────────────────────────
   MIDDLEWARE PRINCIPAL
   ───────────────────────────────────────── */

/**
 * Middleware logMiddleware — Intercepte chaque requête HTTP pour la journaliser.
 * La journalisation est déclenchée sur l'événement "finish" de la réponse,
 * ce qui garantit que le statut HTTP final et le temps d'exécution réel sont capturés.
 *
 * @param {Object}   req  - Objet requête Express
 * @param {Object}   res  - Objet réponse Express
 * @param {Function} next - Passage au middleware ou controller suivant
 */
function logMiddleware(req, res, next) {
  /* Enregistrement du timestamp de début pour calculer le temps d'exécution */
  const startTime = Date.now();

  /* Écoute de l'événement "finish" — déclenché une fois que la réponse est envoyée au client */
  res.on("finish", () => {
    appendLog(req, res, startTime);
  });

  /* Passage immédiat au middleware suivant sans bloquer la requête */
  next();
}

/* ─────────────────────────────────────────
   ÉCRITURE DU LOG
   ───────────────────────────────────────── */

/**
 * Construit et écrit une ligne de log dans le fichier doc.log.
 * Applique une sanitisation stricte pour ne jamais enregistrer
 * de données sensibles (mots de passe, tokens, en-têtes d'autorisation).
 *
 * @param {Object} req       - Objet requête Express
 * @param {Object} res       - Objet réponse Express
 * @param {number} startTime - Timestamp de début de la requête (en ms)
 */
function appendLog(req, res, startTime) {
  /* Calcul du temps de traitement total de la requête en millisecondes */
  const executionTime = Date.now() - startTime;

  /* ── Sanitisation du corps de la requête ──
     Les champs sensibles (motDePasse, password, token) sont extraits et écartés
     via destructuring pour ne jamais apparaître dans les logs */
  let safeBody = "N/A";
  if (req.body && Object.keys(req.body).length > 0) {
    const { motDePasse, password, token, ...safeFields } = req.body;
    safeBody = JSON.stringify(safeFields); // Seuls les champs non-sensibles sont loggués
  }

  /* ── Sanitisation des en-têtes HTTP ──
     Seuls content-type et user-agent sont conservés.
     L'en-tête Authorization (qui contient le token JWT) est volontairement ignoré */
  const safeHeaders = {
    "content-type":  req.headers["content-type"] || "N/A",
    "user-agent":    req.headers["user-agent"]    || "N/A",
  };

  /* Récupération du referer HTTP (page d'origine de la requête) */
  const referer = req.headers.referer || "N/A";

  /* ── Construction de la ligne de log ──
     Format structuré et lisible pour faciliter l'analyse des logs */
  const log =
    `[${new Date().toISOString()}]` +          /* Horodatage ISO précis             */
    ` - ${req.method}` +                        /* Méthode HTTP (GET, POST, etc.)    */
    ` - ${req.originalUrl}` +                   /* URL complète appelée              */
    ` - Status: ${res.statusCode}` +            /* Code de statut HTTP de la réponse */
    ` - ExecutionTime: ${executionTime}ms` +    /* Temps de traitement en ms         */
    ` - Referer: ${referer}` +                  /* Origine de la requête             */
    ` - Body: ${safeBody}` +                    /* Corps sanitisé de la requête      */
    ` - Headers: ${JSON.stringify(safeHeaders)}\n`; /* En-têtes filtrés             */

  /* ── Écriture asynchrone dans le fichier de log ──
     L'écriture est non-bloquante pour ne pas impacter les performances de l'API */
  fs.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.error("Log write error:", err); // Erreur d'écriture signalée dans la console
    }
  });
}

module.exports = logMiddleware;