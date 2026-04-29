/**
 * @file db.js
 * @description Fichier de configuration de la connexion à la base de données MongoDB.
 * @responsibility Établir et gérer la connexion entre l'application et MongoDB via Mongoose.
 * @architecture Situé dans le dossier config/, il est appelé une seule fois au démarrage
 *               de l'application depuis app.js.
 * @fonctionnalité Connexion à MongoDB en utilisant l'URL définie dans les variables d'environnement.
 */

const mongoose = require('mongoose');

/**
 * Établit la connexion à la base de données MongoDB.
 * Utilise l'URL de connexion stockée dans la variable d'environnement `Url_MongoDB`
 * pour ne pas exposer les credentials directement dans le code source.
 * Affiche un message de confirmation en cas de succès, ou une erreur en cas d'échec.
 */
module.exports.connectToMongoDB = async () => {
    mongoose.connect(process.env.Url_MongoDB).then(() =>{
        console.log('Connected to MongoDB'); // Connexion réussie
    }).catch((err) => {
        console.error('Error connecting to MongoDB:',err); // Échec de la connexion — affiche le détail de l'erreur
    });
};