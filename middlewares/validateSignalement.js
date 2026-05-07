const path = require('path');

const validateSignalement = (req, res, next) => {
  const { description, citoyen } = req.body;
  const photo = req.file;

  // ── 1. Photo obligatoire ─────────────────────────────────
  if (!photo) {
    return res.status(400).json({
      success: false,
      error:   "Une photo est obligatoire pour créer un signalement",
    });
  }

  // ── 2. Description obligatoire ───────────────────────────
  if (!description || description.trim() === '') {
    return res.status(400).json({
      success: false,
      error:   "La description est obligatoire",
    });
  }

  const desc = description.trim();

  // ── 3. Longueur minimale ─────────────────────────────────
  if (desc.length < 10) {
    return res.status(400).json({
      success: false,
      error:   "La description doit contenir au moins 10 caractères",
    });
  }

  // ── 4. Longueur maximale ─────────────────────────────────
  if (desc.length > 500) {
    return res.status(400).json({
      success: false,
      error:   "La description ne peut pas dépasser 500 caractères",
    });
  }

  // ── 5. Rejeter les descriptions purement numériques ──────
  if (/^\d+$/.test(desc)) {
    return res.status(400).json({
      success: false,
      error:   "La description ne peut pas contenir uniquement des chiffres",
    });
  }

  // ── 6. Rejeter les descriptions sans lettres réelles ─────
  if (!/[a-zA-ZÀ-ÿ]{3,}/.test(desc)) {
    return res.status(400).json({
      success: false,
      error:   "La description doit contenir des mots réels",
    });
  }

  // ── 7. Citoyen obligatoire ───────────────────────────────
  if (!citoyen || citoyen.trim() === '') {
    return res.status(400).json({
      success: false,
      error:   "L'identifiant du citoyen est obligatoire",
    });
  }

  // ── 8. Validation du fichier image ───────────────────────
  // [FIX] Check mimetype starts with 'image/' instead of exact match
  // Emulators and phones report different subtypes (image/jpg, image/heic, etc.)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExt     = path.extname(photo.originalname || photo.filename || '').toLowerCase();
  const mimetypeOk  = photo.mimetype && photo.mimetype.startsWith('image/');
  const extensionOk = allowedExtensions.some(ext => fileExt === ext) || fileExt === '';

  if (!mimetypeOk && !extensionOk) {
    return res.status(400).json({
      success: false,
      error:   "Format d'image invalide. Formats acceptés : JPEG, PNG, WEBP",
    });
  }

  // ── 9. Taille maximale de l'image (10 MB) ────────────────
  const maxSizeBytes = 10 * 1024 * 1024;
  if (photo.size > maxSizeBytes) {
    return res.status(400).json({
      success: false,
      error:   "L'image est trop volumineuse (max 10 MB)",
    });
  }

  next();
};

module.exports = { validateSignalement };