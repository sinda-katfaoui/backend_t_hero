/**
 * @file uploadfile.js
 * @description Middleware de gestion de l'upload de fichiers images.
 * @responsibility Configurer et exposer un middleware Multer permettant de recevoir,
 *                 valider et stocker les images envoyées par les utilisateurs
 *                 (photos de signalements, avatars, etc.).
 * @architecture Situé dans middlewares/, il est injecté directement dans les routes
 *               qui acceptent des fichiers (ex: création de signalement avec photo).
 * @fonctionnalité Stockage sur disque dans /public/images, validation du format
 *                 et du type MIME, génération de noms de fichiers uniques,
 *                 limite de taille à 5 Mo.
 */

const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

/* ─────────────────────────────────────────
   INITIALISATION DU DOSSIER DE STOCKAGE
   ───────────────────────────────────────── */

/* Chemin absolu vers le dossier de destination des images uploadées */
const uploadPath = path.join(__dirname, "../public/images");

/* Création automatique du dossier /public/images s'il n'existe pas encore */
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ─────────────────────────────────────────
   CONFIGURATION DU STOCKAGE DISQUE
   ───────────────────────────────────────── */

/**
 * Configuration du moteur de stockage Multer (diskStorage).
 * Définit où et sous quel nom chaque fichier uploadé sera enregistré sur le serveur.
 */
const storage = multer.diskStorage({

  /**
   * Définit le dossier de destination de l'image uploadée.
   * Tous les fichiers sont stockés dans /public/images.
   */
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  /**
   * Génère un nom de fichier unique pour éviter les collisions entre uploads.
   * Stratégie : nom original nettoyé + timestamp + nombre aléatoire + extension.
   * Les caractères spéciaux du nom original sont remplacés par des underscores.
   */
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseName      = path.basename(file.originalname, fileExtension)
                              .replace(/[^a-zA-Z0-9]/g, "_"); // Suppression des caractères non alphanumériques
    const uniqueName = `${baseName}_${Date.now()}_${Math.round(Math.random() * 1000)}${fileExtension}`;
    cb(null, uniqueName);
  }
});

/* ─────────────────────────────────────────
   VALIDATION DU TYPE DE FICHIER
   ───────────────────────────────────────── */

/**
 * Filtre de validation des fichiers uploadés.
 * Vérifie que le fichier est bien une image autorisée en contrôlant
 * son extension ET son type MIME.
 * Un fichier est accepté si l'extension OU le MIME est valide (logique OR)
 * pour assurer la compatibilité avec les émulateurs Android dont la caméra
 * envoie parfois un MIME générique "application/octet-stream".
 *
 * @param {Object}   req  - Objet requête Express
 * @param {Object}   file - Fichier reçu par Multer
 * @param {Function} cb   - Callback Multer (true = accepté, Error = refusé)
 */
const fileFilter = (req, file, cb) => {

  /* Extensions d'images autorisées */
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;

  /* Types MIME autorisés — "application/octet-stream" inclus pour compatibilité émulateur caméra */
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/octet-stream', // ← fix compatibilité caméra émulateur Android
  ];

  /* Vérification de la validité de l'extension du fichier */
  const extValid  = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase());

  /* Vérification de la validité du type MIME déclaré par le client */
  const mimeValid = allowedMimes.includes(file.mimetype);

  /* Acceptation si l'extension OU le MIME est valide (OR au lieu de AND
     pour tolérer les cas où le MIME est générique mais l'extension est correcte) */
  if (extValid || mimeValid) {
    cb(null, true); // Fichier accepté
  } else {
    /* Fichier refusé — format non supporté */
    cb(new Error(
      "Format non supporté. Formats acceptés: jpeg, jpg, png, gif, webp"));
  }
};

/* ─────────────────────────────────────────
   INSTANCE MULTER FINALE
   ───────────────────────────────────────── */

/**
 * Instance Multer configurée et prête à être utilisée comme middleware dans les routes.
 * Paramètres appliqués :
 *  - storage   : stockage sur disque dans /public/images avec noms uniques
 *  - fileFilter: validation du type de fichier (images uniquement)
 *  - limits    : taille maximale du fichier fixée à 5 Mo
 */
const uploadfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo maximum par fichier
});

module.exports = uploadfile;