/**
 * ============================================================
 * FICHIER  : scripts/fix_orphan_data.js
 * RÔLE     : Script de nettoyage one-shot des données orphelines
 * USAGE    : node scripts/fix_orphan_data.js
 * ACTION   : Traite tous les documents Signalement et User
 *            qui n'ont pas de municipalityId défini
 *
 * CHOISIR UNE OPTION :
 *   Option A — Supprimer les documents orphelins (défaut)
 *   Option B — Assigner une municipalité par défaut
 *              → renseigner DEFAULT_MUNICIPALITY_ID ci-dessous
 *
 * ⚠️  EXÉCUTER UNE SEULE FOIS puis supprimer ce fichier
 * ============================================================
 */

require('dotenv').config();
const mongoose    = require('mongoose');
const Signalement = require('../models/signalement.model');
const User        = require('../models/user.model');

// ─── CONFIGURATION ───────────────────────────────────────────
// Option B uniquement : coller ici un ObjectId MongoDB valide
// d'une municipalité existante dans votre base de données.
// Laisser null pour utiliser Option A (suppression).
const DEFAULT_MUNICIPALITY_ID = null;
// ─────────────────────────────────────────────────────────────

const Url_MongoDB = process.env.Url_MongoDB || process.env.DB_URI || process.env.Url_MongoDB;

async function run() {
  if (!Url_MongoDB) {
    console.error("❌ Aucune URI MongoDB trouvée dans les variables d'environnement.");
    console.error("   Vérifiez votre fichier .env (MONGO_URI, DB_URI ou MONGODB_URI).");
    process.exit(1);
  }

  console.log("🔌 Connexion à MongoDB...");
  await mongoose.connect(Url_MongoDB);
  console.log("✅ Connecté\n");

  // Filtre pour cibler les documents sans municipalityId
  const orphanFilter = {
    $or: [
      { municipalityId: null },
      { municipalityId: { $exists: false } },
    ],
  };

  // Compter avant d'agir
  const sigCount  = await Signalement.countDocuments(orphanFilter);
  const userCount = await User.countDocuments(orphanFilter);

  console.log(`📊 Documents orphelins trouvés :`);
  console.log(`   Signalements : ${sigCount}`);
  console.log(`   Utilisateurs : ${userCount}`);

  if (sigCount === 0 && userCount === 0) {
    console.log("\n✅ Aucun document orphelin. Base de données déjà propre.");
    await mongoose.disconnect();
    return;
  }

  if (DEFAULT_MUNICIPALITY_ID) {
    // ── Option B : Assignation à une municipalité par défaut ──
    console.log(`\n🔧 Option B — Assignation à la municipalité : ${DEFAULT_MUNICIPALITY_ID}`);

    const sigResult  = await Signalement.updateMany(orphanFilter, {
      $set: { municipalityId: DEFAULT_MUNICIPALITY_ID },
    });
    const userResult = await User.updateMany(orphanFilter, {
      $set: { municipalityId: DEFAULT_MUNICIPALITY_ID },
    });

    console.log(`✅ Signalements mis à jour : ${sigResult.modifiedCount}`);
    console.log(`✅ Utilisateurs mis à jour  : ${userResult.modifiedCount}`);
  } else {
    // ── Option A : Suppression des documents orphelins ──
    console.log("\n🗑️  Option A — Suppression des documents orphelins...");

    const sigResult  = await Signalement.deleteMany(orphanFilter);
    const userResult = await User.deleteMany(orphanFilter);

    console.log(`✅ Signalements supprimés : ${sigResult.deletedCount}`);
    console.log(`✅ Utilisateurs supprimés : ${userResult.deletedCount}`);
  }

  console.log("\n✅ Nettoyage terminé. Vous pouvez supprimer ce script.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Erreur fatale :", err.message);
  process.exit(1);
});