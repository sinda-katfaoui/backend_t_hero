/**
 * ============================================================
 * FICHIER  : municipalities.routes.js
 * RÔLE     : Routes de gestion des municipalités
 * ============================================================
 */

const express      = require("express");
const router       = express.Router();
const Municipality = require("../models/municipality.model");

// GET /municipalities → toutes les municipalités
router.get("/", async (req, res) => {
  try {
    const municipalities = await Municipality.find().sort({ governorate: 1, name: 1 });
    res.status(200).json({ success: true, data: municipalities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// GET /municipalities/by-governorate/:gov → municipalités par gouvernorat
router.get("/by-governorate/:gov", async (req, res) => {
  try {
    const governorate    = decodeURIComponent(req.params.gov);
    const municipalities = await Municipality.find({ governorate }).sort({ name: 1 });
    res.status(200).json({ success: true, data: municipalities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;