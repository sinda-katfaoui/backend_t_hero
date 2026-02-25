// LogMiddleware.js
const fs = require("fs");
const path = require("path"); // Importer le module path

/**
 * Middleware pour logger les requêtes HTTP
 */
function logMiddleware(req, res, next) {
    const startTime = new Date(); // Temps de début de la requête

    // On attend que la réponse soit terminée pour enregistrer le log
    res.on("finish", () => {
        appendLog(req, res, startTime);
    });

    next();
}

/**
 * Fonction pour écrire le log dans un fichier
 */
function appendLog(req, res, startTime) {
    const endTime = new Date(); // Temps de fin
    const executionTime = endTime - startTime; // Temps d'exécution en ms
    const headers = JSON.stringify(req.headers);
    const body = Object.keys(req.body || {}).length > 0 ? JSON.stringify(req.body) : "N/A";
    const referer = req.headers.referer || "N/A";

    const log = `[${new Date().toISOString()}] - ${req.method} - ${req.originalUrl} - Status: ${res.statusCode} - ExecutionTime: ${executionTime}ms - Referer: ${referer} - Body: ${body} - Headers: ${headers}\n`;

    const logsDirectory = path.join(__dirname, "logs"); // Chemin du dossier logs

    // Vérifier si le dossier logs existe, sinon le créer
    if (!fs.existsSync(logsDirectory)) {
        fs.mkdirSync(logsDirectory, { recursive: true });
    }

    const logFilePath = path.join(logsDirectory, "auth.log"); // Chemin complet du fichier log

    fs.appendFile(logFilePath, log, (err) => {
        if (err) {
            console.error("Erreur lors de l'écriture du log :", err);
        }
    });
}

module.exports = logMiddleware;