/**
 * @file app.js
 * @description Point d'entrée principal de l'application backend T Hero.
 * @responsibility Initialiser le serveur Express, configurer les middlewares globaux,
 *                 enregistrer toutes les routes de l'API et démarrer le serveur HTTP.
 * @architecture Fichier racine du projet — orchestre l'ensemble des composants :
 *               configuration, middlewares, routes, et connexion à la base de données.
 * @fonctionnalité Démarre l'API REST et établit la connexion MongoDB au lancement du serveur.
 *                 [UPDATED] Ajout de la route /municipalities pour le système multi-municipalité
 */

var express = require('express');
var path    = require('path');
var cookieParser = require('cookie-parser');
var logger  = require('morgan');
const http  = require('http');

/* Chargement des variables d'environnement depuis le fichier .env */
require('dotenv').config();

/* Import de la fonction de connexion à MongoDB */
const { connectToMongoDB } = require('./config/db');

/* Import de tous les routeurs de l'application */
var usersRouter          = require('./routes/users.routes');
var signalementsRouter   = require('./routes/signalements.routes');
var categoriesRouter     = require('./routes/categories.routes');
var notificationsRouter  = require('./routes/notifications.routes');
var analyseAIRouter      = require('./routes/analyseAI.routes');
var municipalitiesRouter = require('./routes/municipalities.routes'); // [ADDED]

/* Création de l'instance principale Express */
var app = express();

/* ─────────────────────────────────────────
   MIDDLEWARES GLOBAUX
   ───────────────────────────────────────── */

/* Journalisation de chaque requête HTTP entrante en mode développement */
app.use(logger('dev'));

/**
 * Middleware CORS (Cross-Origin Resource Sharing).
 * Permet à des clients externes (ex: application mobile ou frontend web)
 * d'accéder à l'API depuis un domaine différent.
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* Parsing du corps des requêtes JSON — limite fixée à 50mb pour supporter les images en base64 */
app.use(express.json({ limit: '50mb' }));

/* Parsing des données de formulaires URL-encodées */
app.use(express.urlencoded({ limit: '50mb', extended: false }));

/* Parsing des cookies présents dans les requêtes */
app.use(cookieParser());

/* Service des fichiers statiques (images uploadées, assets publics, etc.) */
app.use(express.static(path.join(__dirname, 'public')));

/* ─────────────────────────────────────────
   ROUTES DE L'API
   ───────────────────────────────────────── */

/* Toutes les routes liées à la gestion des utilisateurs */
app.use('/users',          usersRouter);

/* Toutes les routes liées aux signalements citoyens */
app.use('/signalements',   signalementsRouter);

/* Toutes les routes liées aux catégories de signalements */
app.use('/categories',     categoriesRouter);

/* Toutes les routes liées aux notifications */
app.use('/notifications',  notificationsRouter);

/* Toutes les routes liées à l'analyse par intelligence artificielle */
app.use('/analyseAI',      analyseAIRouter);

/* [ADDED] Routes liées au système multi-municipalité */
app.use('/municipalities', municipalitiesRouter);

/* ─────────────────────────────────────────
   GESTION DES ERREURS
   ───────────────────────────────────────── */

/**
 * Middleware de capture des routes inexistantes (404).
 */
app.use(function (req, res) {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Middleware global de gestion des erreurs applicatives.
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

/* ─────────────────────────────────────────
   DÉMARRAGE DU SERVEUR
   ───────────────────────────────────────── */

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});