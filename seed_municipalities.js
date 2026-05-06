/**
 * ============================================================
 * FICHIER  : seed_municipalities.js
 * RÔLE     : Script de peuplement de la base de données
 * USAGE    : node seed_municipalities.js
 * PLACE    : Racine du projet (même dossier que app.js)
 * ============================================================
 */

require('dotenv').config();
const mongoose     = require('mongoose');
const Municipality = require('./models/municipality.model');
const { Url_MongoDB } = require('./config/db');

const municipalities = [

  // ── Tunis ──────────────────────────────────────────────────
  { name: 'Tunis',             governorate: 'Tunis',     invitationCode: 'TUN-001' },
  { name: 'La Marsa',          governorate: 'Tunis',     invitationCode: 'TUN-002' },
  { name: 'Le Bardo',          governorate: 'Tunis',     invitationCode: 'TUN-003' },
  { name: 'La Goulette',       governorate: 'Tunis',     invitationCode: 'TUN-004' },
  { name: 'Carthage',          governorate: 'Tunis',     invitationCode: 'TUN-005' },
  { name: 'Sidi Bou Said',     governorate: 'Tunis',     invitationCode: 'TUN-006' },
  { name: 'Le Kram',           governorate: 'Tunis',     invitationCode: 'TUN-007' },
  { name: 'Ezzouhour',         governorate: 'Tunis',     invitationCode: 'TUN-008' },
  { name: 'Ettahrir',          governorate: 'Tunis',     invitationCode: 'TUN-009' },
  { name: 'Séjoumi',           governorate: 'Tunis',     invitationCode: 'TUN-010' },
  { name: 'Sijoumi',           governorate: 'Tunis',     invitationCode: 'TUN-011' },
  { name: 'Kabaria',           governorate: 'Tunis',     invitationCode: 'TUN-012' },
  { name: 'Sidi Hassine',      governorate: 'Tunis',     invitationCode: 'TUN-013' },
  { name: 'El Ouardia',        governorate: 'Tunis',     invitationCode: 'TUN-014' },
  { name: 'El Menzah',         governorate: 'Tunis',     invitationCode: 'TUN-015' },
  { name: 'El Omrane',         governorate: 'Tunis',     invitationCode: 'TUN-016' },
  { name: 'Médina',            governorate: 'Tunis',     invitationCode: 'TUN-017' },
  { name: 'Jellaz',            governorate: 'Tunis',     invitationCode: 'TUN-018' },

  // ── Ariana ─────────────────────────────────────────────────
  { name: 'Ariana Ville',      governorate: 'Ariana',    invitationCode: 'ARI-001' },
  { name: 'Ettadhamen',        governorate: 'Ariana',    invitationCode: 'ARI-002' },
  { name: 'Mnihla',            governorate: 'Ariana',    invitationCode: 'ARI-003' },
  { name: 'Kalâat el-Andalous',governorate: 'Ariana',    invitationCode: 'ARI-004' },
  { name: 'Sidi Thabet',       governorate: 'Ariana',    invitationCode: 'ARI-005' },
  { name: 'Raoued',            governorate: 'Ariana',    invitationCode: 'ARI-006' },
  { name: 'La Soukra',         governorate: 'Ariana',    invitationCode: 'ARI-007' },
  { name: 'Borj el-Baccouche', governorate: 'Ariana',    invitationCode: 'ARI-008' },

  // ── Ben Arous ───────────────────────────────────────────────
  { name: 'Ben Arous',         governorate: 'Ben Arous',  invitationCode: 'BNA-001' },
  { name: 'Mégrine',           governorate: 'Ben Arous',  invitationCode: 'BNA-002' },
  { name: 'Ezzahra',           governorate: 'Ben Arous',  invitationCode: 'BNA-003' },
  { name: 'Hammam Lif',        governorate: 'Ben Arous',  invitationCode: 'BNA-004' },
  { name: 'Hammam Chott',      governorate: 'Ben Arous',  invitationCode: 'BNA-005' },
  { name: 'Bou Mhel el-Bassatine', governorate: 'Ben Arous', invitationCode: 'BNA-006' },
  { name: 'El Mourouj',        governorate: 'Ben Arous',  invitationCode: 'BNA-007' },
  { name: 'Fouchana',          governorate: 'Ben Arous',  invitationCode: 'BNA-008' },
  { name: 'Mornag',            governorate: 'Ben Arous',  invitationCode: 'BNA-009' },
  { name: 'Khalidia',          governorate: 'Ben Arous',  invitationCode: 'BNA-010' },
  { name: 'Nouvelle Medina',   governorate: 'Ben Arous',  invitationCode: 'BNA-011' },
  { name: 'Radès',             governorate: 'Ben Arous',  invitationCode: 'BNA-012' },

  // ── Manouba ─────────────────────────────────────────────────
  { name: 'Manouba',           governorate: 'Manouba',   invitationCode: 'MAN-001' },
  { name: 'Den Den',           governorate: 'Manouba',   invitationCode: 'MAN-002' },
  { name: 'Douar Hicher',      governorate: 'Manouba',   invitationCode: 'MAN-003' },
  { name: 'Oued Ellil',        governorate: 'Manouba',   invitationCode: 'MAN-004' },
  { name: 'Mornaguia',         governorate: 'Manouba',   invitationCode: 'MAN-005' },
  { name: 'Borj el-Amri',      governorate: 'Manouba',   invitationCode: 'MAN-006' },
  { name: 'El Battan',         governorate: 'Manouba',   invitationCode: 'MAN-007' },
  { name: 'Jedaïda',           governorate: 'Manouba',   invitationCode: 'MAN-008' },
  { name: 'Tebourba',          governorate: 'Manouba',   invitationCode: 'MAN-009' },

  // ── Nabeul ──────────────────────────────────────────────────
  { name: 'Nabeul',            governorate: 'Nabeul',    invitationCode: 'NAB-001' },
  { name: 'Hammamet',          governorate: 'Nabeul',    invitationCode: 'NAB-002' },
  { name: 'Kelibia',           governorate: 'Nabeul',    invitationCode: 'NAB-003' },
  { name: 'Grombalia',         governorate: 'Nabeul',    invitationCode: 'NAB-004' },
  { name: 'Bou Argoub',        governorate: 'Nabeul',    invitationCode: 'NAB-005' },
  { name: 'Menzel Bouzelfa',   governorate: 'Nabeul',    invitationCode: 'NAB-006' },
  { name: 'Menzel Temime',     governorate: 'Nabeul',    invitationCode: 'NAB-007' },
  { name: 'El Haouaria',       governorate: 'Nabeul',    invitationCode: 'NAB-008' },
  { name: 'Takelsa',           governorate: 'Nabeul',    invitationCode: 'NAB-009' },
  { name: 'Soliman',           governorate: 'Nabeul',    invitationCode: 'NAB-010' },
  { name: 'Korba',             governorate: 'Nabeul',    invitationCode: 'NAB-011' },
  { name: 'Mida',              governorate: 'Nabeul',    invitationCode: 'NAB-012' },
  { name: 'Beni Khalled',      governorate: 'Nabeul',    invitationCode: 'NAB-013' },
  { name: 'Dar Chaabane',      governorate: 'Nabeul',    invitationCode: 'NAB-014' },
  { name: 'Béni Khiar',        governorate: 'Nabeul',    invitationCode: 'NAB-015' },

  // ── Zaghouan ────────────────────────────────────────────────
  { name: 'Zaghouan',          governorate: 'Zaghouan',  invitationCode: 'ZAG-001' },
  { name: 'Zriba',             governorate: 'Zaghouan',  invitationCode: 'ZAG-002' },
  { name: 'Nadhour',           governorate: 'Zaghouan',  invitationCode: 'ZAG-003' },
  { name: 'El Fahs',           governorate: 'Zaghouan',  invitationCode: 'ZAG-004' },
  { name: 'El Aaïn',           governorate: 'Zaghouan',  invitationCode: 'ZAG-005' },
  { name: 'Bir Mcherga',       governorate: 'Zaghouan',  invitationCode: 'ZAG-006' },

  // ── Bizerte ─────────────────────────────────────────────────
  { name: 'Bizerte Nord',      governorate: 'Bizerte',   invitationCode: 'BIZ-001' },
  { name: 'Bizerte Sud',       governorate: 'Bizerte',   invitationCode: 'BIZ-002' },
  { name: 'Menzel Bourguiba',  governorate: 'Bizerte',   invitationCode: 'BIZ-003' },
  { name: 'Mateur',            governorate: 'Bizerte',   invitationCode: 'BIZ-004' },
  { name: 'Menzel Jemil',      governorate: 'Bizerte',   invitationCode: 'BIZ-005' },
  { name: 'El Alia',           governorate: 'Bizerte',   invitationCode: 'BIZ-006' },
  { name: 'Ras Jebel',         governorate: 'Bizerte',   invitationCode: 'BIZ-007' },
  { name: 'Ghar El Melh',      governorate: 'Bizerte',   invitationCode: 'BIZ-008' },
  { name: 'Joumine',           governorate: 'Bizerte',   invitationCode: 'BIZ-009' },
  { name: 'Sejenane',          governorate: 'Bizerte',   invitationCode: 'BIZ-010' },
  { name: 'Tinja',             governorate: 'Bizerte',   invitationCode: 'BIZ-011' },
  { name: 'Utique',            governorate: 'Bizerte',   invitationCode: 'BIZ-012' },
  { name: 'Ghezala',           governorate: 'Bizerte',   invitationCode: 'BIZ-013' },

  // ── Béja ────────────────────────────────────────────────────
  { name: 'Béja Nord',         governorate: 'Béja',      invitationCode: 'BEJ-001' },
  { name: 'Béja Sud',          governorate: 'Béja',      invitationCode: 'BEJ-002' },
  { name: 'Amdoun',            governorate: 'Béja',      invitationCode: 'BEJ-003' },
  { name: 'Nefza',             governorate: 'Béja',      invitationCode: 'BEJ-004' },
  { name: 'Téboursouk',        governorate: 'Béja',      invitationCode: 'BEJ-005' },
  { name: 'Testour',           governorate: 'Béja',      invitationCode: 'BEJ-006' },
  { name: 'Goubellat',         governorate: 'Béja',      invitationCode: 'BEJ-007' },
  { name: 'Medjez el-Bab',     governorate: 'Béja',      invitationCode: 'BEJ-008' },

  // ── Jendouba ────────────────────────────────────────────────
  { name: 'Jendouba',          governorate: 'Jendouba',  invitationCode: 'JEN-001' },
  { name: 'Jendouba Nord',     governorate: 'Jendouba',  invitationCode: 'JEN-002' },
  { name: 'Bou Salem',         governorate: 'Jendouba',  invitationCode: 'JEN-003' },
  { name: 'Tabarka',           governorate: 'Jendouba',  invitationCode: 'JEN-004' },
  { name: 'Aïn Draham',        governorate: 'Jendouba',  invitationCode: 'JEN-005' },
  { name: 'Fernana',           governorate: 'Jendouba',  invitationCode: 'JEN-006' },
  { name: 'Ghardimaou',        governorate: 'Jendouba',  invitationCode: 'JEN-007' },
  { name: 'Oued Meliz',        governorate: 'Jendouba',  invitationCode: 'JEN-008' },
  { name: 'Babouch',           governorate: 'Jendouba',  invitationCode: 'JEN-009' },

  // ── Le Kef ──────────────────────────────────────────────────
  { name: 'Le Kef Ouest',      governorate: 'Le Kef',    invitationCode: 'KEF-001' },
  { name: 'Le Kef Est',        governorate: 'Le Kef',    invitationCode: 'KEF-002' },
  { name: 'Nebeur',            governorate: 'Le Kef',    invitationCode: 'KEF-003' },
  { name: 'Sakiet Sidi Youssef', governorate: 'Le Kef',  invitationCode: 'KEF-004' },
  { name: 'Tajerouine',        governorate: 'Le Kef',    invitationCode: 'KEF-005' },
  { name: 'Kalaat Senan',      governorate: 'Le Kef',    invitationCode: 'KEF-006' },
  { name: 'Kalaat Khasba',     governorate: 'Le Kef',    invitationCode: 'KEF-007' },
  { name: 'Jerissa',           governorate: 'Le Kef',    invitationCode: 'KEF-008' },
  { name: 'El Ksour',          governorate: 'Le Kef',    invitationCode: 'KEF-009' },
  { name: 'Dahmani',           governorate: 'Le Kef',    invitationCode: 'KEF-010' },
  { name: 'Sers',              governorate: 'Le Kef',    invitationCode: 'KEF-011' },

  // ── Siliana ─────────────────────────────────────────────────
  { name: 'Siliana Nord',      governorate: 'Siliana',   invitationCode: 'SIL-001' },
  { name: 'Siliana Sud',       governorate: 'Siliana',   invitationCode: 'SIL-002' },
  { name: 'Bou Arada',         governorate: 'Siliana',   invitationCode: 'SIL-003' },
  { name: 'Gaâfour',           governorate: 'Siliana',   invitationCode: 'SIL-004' },
  { name: 'El Aroussa',        governorate: 'Siliana',   invitationCode: 'SIL-005' },
  { name: 'El Krib',           governorate: 'Siliana',   invitationCode: 'SIL-006' },
  { name: 'Bargou',            governorate: 'Siliana',   invitationCode: 'SIL-007' },
  { name: 'Makthar',           governorate: 'Siliana',   invitationCode: 'SIL-008' },
  { name: 'Rouhia',            governorate: 'Siliana',   invitationCode: 'SIL-009' },
  { name: 'Kesra',             governorate: 'Siliana',   invitationCode: 'SIL-010' },
  { name: 'Sidi Bou Rouis',    governorate: 'Siliana',   invitationCode: 'SIL-011' },

  // ── Sousse ──────────────────────────────────────────────────
  { name: 'Sousse Médina',     governorate: 'Sousse',    invitationCode: 'SOU-001' },
  { name: 'Sousse Riadh',      governorate: 'Sousse',    invitationCode: 'SOU-002' },
  { name: 'Sousse Jawhara',    governorate: 'Sousse',    invitationCode: 'SOU-003' },
  { name: 'Sousse Sidi Abdelhamid', governorate: 'Sousse', invitationCode: 'SOU-004' },
  { name: 'Hammam Sousse',     governorate: 'Sousse',    invitationCode: 'SOU-005' },
  { name: 'Akouda',            governorate: 'Sousse',    invitationCode: 'SOU-006' },
  { name: 'Kalâa Kebira',      governorate: 'Sousse',    invitationCode: 'SOU-007' },
  { name: 'Sidi Bou Ali',      governorate: 'Sousse',    invitationCode: 'SOU-008' },
  { name: 'Hergla',            governorate: 'Sousse',    invitationCode: 'SOU-009' },
  { name: 'Enfidha',           governorate: 'Sousse',    invitationCode: 'SOU-010' },
  { name: 'Bouficha',          governorate: 'Sousse',    invitationCode: 'SOU-011' },
  { name: 'Kondar',            governorate: 'Sousse',    invitationCode: 'SOU-012' },
  { name: 'Sidi El Hani',      governorate: 'Sousse',    invitationCode: 'SOU-013' },
  { name: 'M\'saken',          governorate: 'Sousse',    invitationCode: 'SOU-014' },
  { name: 'Kalâa Seghira',     governorate: 'Sousse',    invitationCode: 'SOU-015' },

  // ── Monastir ────────────────────────────────────────────────
  { name: 'Monastir',          governorate: 'Monastir',  invitationCode: 'MON-001' },
  { name: 'Skanes',            governorate: 'Monastir',  invitationCode: 'MON-002' },
  { name: 'Jemmal',            governorate: 'Monastir',  invitationCode: 'MON-003' },
  { name: 'Bembla',            governorate: 'Monastir',  invitationCode: 'MON-004' },
  { name: 'Zeramdine',         governorate: 'Monastir',  invitationCode: 'MON-005' },
  { name: 'Beni Hassen',       governorate: 'Monastir',  invitationCode: 'MON-006' },
  { name: 'Sahline',           governorate: 'Monastir',  invitationCode: 'MON-007' },
  { name: 'Touza',             governorate: 'Monastir',  invitationCode: 'MON-008' },
  { name: 'Sayada-Lamta-Bouhjar', governorate: 'Monastir', invitationCode: 'MON-009' },
  { name: 'Ksar Hellal',       governorate: 'Monastir',  invitationCode: 'MON-010' },
  { name: 'Ksibet el-Médiouni',governorate: 'Monastir',  invitationCode: 'MON-011' },
  { name: 'Ouerdanine',        governorate: 'Monastir',  invitationCode: 'MON-012' },
  { name: 'Moknine',           governorate: 'Monastir',  invitationCode: 'MON-013' },
  { name: 'Téboulba',          governorate: 'Monastir',  invitationCode: 'MON-014' },

  // ── Mahdia ──────────────────────────────────────────────────
  { name: 'Mahdia',            governorate: 'Mahdia',    invitationCode: 'MAH-001' },
  { name: 'Bou Merdes',        governorate: 'Mahdia',    invitationCode: 'MAH-002' },
  { name: 'Ouled Chamekh',     governorate: 'Mahdia',    invitationCode: 'MAH-003' },
  { name: 'Chorbane',          governorate: 'Mahdia',    invitationCode: 'MAH-004' },
  { name: 'Hebira',            governorate: 'Mahdia',    invitationCode: 'MAH-005' },
  { name: 'Essouassi',         governorate: 'Mahdia',    invitationCode: 'MAH-006' },
  { name: 'El Djem',           governorate: 'Mahdia',    invitationCode: 'MAH-007' },
  { name: 'Chebba',            governorate: 'Mahdia',    invitationCode: 'MAH-008' },
  { name: 'Melloulèche',       governorate: 'Mahdia',    invitationCode: 'MAH-009' },
  { name: 'Sidi Alouane',      governorate: 'Mahdia',    invitationCode: 'MAH-010' },
  { name: 'Ksour Essef',       governorate: 'Mahdia',    invitationCode: 'MAH-011' },

  // ── Sfax ────────────────────────────────────────────────────
  { name: 'Sfax Médina',       governorate: 'Sfax',      invitationCode: 'SFX-001' },
  { name: 'Sfax Ouest',        governorate: 'Sfax',      invitationCode: 'SFX-002' },
  { name: 'Sfax Sud',          governorate: 'Sfax',      invitationCode: 'SFX-003' },
  { name: 'Sakiet Ezzit',      governorate: 'Sfax',      invitationCode: 'SFX-004' },
  { name: 'Sakiet Eddaïer',    governorate: 'Sfax',      invitationCode: 'SFX-005' },
  { name: 'Thyna',             governorate: 'Sfax',      invitationCode: 'SFX-006' },
  { name: 'Agareb',            governorate: 'Sfax',      invitationCode: 'SFX-007' },
  { name: 'Jebeniana',         governorate: 'Sfax',      invitationCode: 'SFX-008' },
  { name: 'El Amra',           governorate: 'Sfax',      invitationCode: 'SFX-009' },
  { name: 'El Hencha',         governorate: 'Sfax',      invitationCode: 'SFX-010' },
  { name: 'Menzel Chaker',     governorate: 'Sfax',      invitationCode: 'SFX-011' },
  { name: 'Ghraïba',           governorate: 'Sfax',      invitationCode: 'SFX-012' },
  { name: 'Bir Ali Ben Khalifa', governorate: 'Sfax',    invitationCode: 'SFX-013' },
  { name: 'Skhira',            governorate: 'Sfax',      invitationCode: 'SFX-014' },
  { name: 'Mahres',            governorate: 'Sfax',      invitationCode: 'SFX-015' },
  { name: 'Kerkennah',         governorate: 'Sfax',      invitationCode: 'SFX-016' },

  // ── Kairouan ────────────────────────────────────────────────
  { name: 'Kairouan Nord',     governorate: 'Kairouan',  invitationCode: 'KAI-001' },
  { name: 'Kairouan Sud',      governorate: 'Kairouan',  invitationCode: 'KAI-002' },
  { name: 'El Alaa',           governorate: 'Kairouan',  invitationCode: 'KAI-003' },
  { name: 'Echrarda',          governorate: 'Kairouan',  invitationCode: 'KAI-004' },
  { name: 'Nasrallah',         governorate: 'Kairouan',  invitationCode: 'KAI-005' },
  { name: 'El Oueslatia',      governorate: 'Kairouan',  invitationCode: 'KAI-006' },
  { name: 'Menzel Mehiri',     governorate: 'Kairouan',  invitationCode: 'KAI-007' },
  { name: 'Haffouz',           governorate: 'Kairouan',  invitationCode: 'KAI-008' },
  { name: 'El Ala',            governorate: 'Kairouan',  invitationCode: 'KAI-009' },
  { name: 'Hajeb El Ayoun',    governorate: 'Kairouan',  invitationCode: 'KAI-010' },
  { name: 'Sbikha',            governorate: 'Kairouan',  invitationCode: 'KAI-011' },
  { name: 'Bouhajla',          governorate: 'Kairouan',  invitationCode: 'KAI-012' },

  // ── Kasserine ───────────────────────────────────────────────
  { name: 'Kasserine Nord',    governorate: 'Kasserine', invitationCode: 'KAS-001' },
  { name: 'Kasserine Sud',     governorate: 'Kasserine', invitationCode: 'KAS-002' },
  { name: 'Ezzouhour',         governorate: 'Kasserine', invitationCode: 'KAS-003' },
  { name: 'Hassi El Ferid',    governorate: 'Kasserine', invitationCode: 'KAS-004' },
  { name: 'Majel Bel Abbès',   governorate: 'Kasserine', invitationCode: 'KAS-005' },
  { name: 'Jouhar',            governorate: 'Kasserine', invitationCode: 'KAS-006' },
  { name: 'El Ayoun',          governorate: 'Kasserine', invitationCode: 'KAS-007' },
  { name: 'Thala',             governorate: 'Kasserine', invitationCode: 'KAS-008' },
  { name: 'Hidra',             governorate: 'Kasserine', invitationCode: 'KAS-009' },
  { name: 'Foussana',          governorate: 'Kasserine', invitationCode: 'KAS-010' },
  { name: 'Feriana',           governorate: 'Kasserine', invitationCode: 'KAS-011' },
  { name: 'Sbeitla',           governorate: 'Kasserine', invitationCode: 'KAS-012' },
  { name: 'Sbiba',             governorate: 'Kasserine', invitationCode: 'KAS-013' },

  // ── Sidi Bouzid ─────────────────────────────────────────────
  { name: 'Sidi Bouzid Ouest', governorate: 'Sidi Bouzid', invitationCode: 'SBO-001' },
  { name: 'Sidi Bouzid Est',   governorate: 'Sidi Bouzid', invitationCode: 'SBO-002' },
  { name: 'Jilma',             governorate: 'Sidi Bouzid', invitationCode: 'SBO-003' },
  { name: 'Cebalet Ouled Asker', governorate: 'Sidi Bouzid', invitationCode: 'SBO-004' },
  { name: 'Bir El Hafey',      governorate: 'Sidi Bouzid', invitationCode: 'SBO-005' },
  { name: 'Sidi Ali Ben Aoun', governorate: 'Sidi Bouzid', invitationCode: 'SBO-006' },
  { name: 'Menzel Bouzaiane',  governorate: 'Sidi Bouzid', invitationCode: 'SBO-007' },
  { name: 'El Meknassy',       governorate: 'Sidi Bouzid', invitationCode: 'SBO-008' },
  { name: 'Souk Jedid',        governorate: 'Sidi Bouzid', invitationCode: 'SBO-009' },
  { name: 'Mezzouna',          governorate: 'Sidi Bouzid', invitationCode: 'SBO-010' },
  { name: 'Regueb',            governorate: 'Sidi Bouzid', invitationCode: 'SBO-011' },
  { name: 'Ouled Haffouz',     governorate: 'Sidi Bouzid', invitationCode: 'SBO-012' },

  // ── Gabès ───────────────────────────────────────────────────
  { name: 'Gabès Médina',      governorate: 'Gabès',     invitationCode: 'GAB-001' },
  { name: 'Gabès Ouest',       governorate: 'Gabès',     invitationCode: 'GAB-002' },
  { name: 'Gabès Sud',         governorate: 'Gabès',     invitationCode: 'GAB-003' },
  { name: 'Ghannouch',         governorate: 'Gabès',     invitationCode: 'GAB-004' },
  { name: 'El Hamma',          governorate: 'Gabès',     invitationCode: 'GAB-005' },
  { name: 'Matmata',           governorate: 'Gabès',     invitationCode: 'GAB-006' },
  { name: 'Nouvelle Matmata',  governorate: 'Gabès',     invitationCode: 'GAB-007' },
  { name: 'Mareth',            governorate: 'Gabès',     invitationCode: 'GAB-008' },
  { name: 'Métouia',           governorate: 'Gabès',     invitationCode: 'GAB-009' },
  { name: 'Menzel El Habib',   governorate: 'Gabès',     invitationCode: 'GAB-010' },

  // ── Médenine ────────────────────────────────────────────────
  { name: 'Médenine Nord',     governorate: 'Médenine',  invitationCode: 'MED-001' },
  { name: 'Médenine Sud',      governorate: 'Médenine',  invitationCode: 'MED-002' },
  { name: 'Ben Gardane',       governorate: 'Médenine',  invitationCode: 'MED-003' },
  { name: 'Zarzis',            governorate: 'Médenine',  invitationCode: 'MED-004' },
  { name: 'Jerba Houmet Souk', governorate: 'Médenine',  invitationCode: 'MED-005' },
  { name: 'Jerba Midoun',      governorate: 'Médenine',  invitationCode: 'MED-006' },
  { name: 'Jerba Ajim',        governorate: 'Médenine',  invitationCode: 'MED-007' },
  { name: 'Sidi Makhlouf',     governorate: 'Médenine',  invitationCode: 'MED-008' },
  { name: 'Beni Khedache',     governorate: 'Médenine',  invitationCode: 'MED-009' },

  // ── Tataouine ───────────────────────────────────────────────
  { name: 'Tataouine Nord',    governorate: 'Tataouine', invitationCode: 'TAT-001' },
  { name: 'Tataouine Sud',     governorate: 'Tataouine', invitationCode: 'TAT-002' },
  { name: 'Smâr',              governorate: 'Tataouine', invitationCode: 'TAT-003' },
  { name: 'Bir Lahmar',        governorate: 'Tataouine', invitationCode: 'TAT-004' },
  { name: 'Ghomrassen',        governorate: 'Tataouine', invitationCode: 'TAT-005' },
  { name: 'Remada',            governorate: 'Tataouine', invitationCode: 'TAT-006' },
  { name: 'Dehiba',            governorate: 'Tataouine', invitationCode: 'TAT-007' },

  // ── Gafsa ───────────────────────────────────────────────────
  { name: 'Gafsa Nord',        governorate: 'Gafsa',     invitationCode: 'GAF-001' },
  { name: 'Gafsa Sud',         governorate: 'Gafsa',     invitationCode: 'GAF-002' },
  { name: 'Sidi Aïch',         governorate: 'Gafsa',     invitationCode: 'GAF-003' },
  { name: 'El Ksar',           governorate: 'Gafsa',     invitationCode: 'GAF-004' },
  { name: 'Métlaoui',          governorate: 'Gafsa',     invitationCode: 'GAF-005' },
  { name: 'El Guettar',        governorate: 'Gafsa',     invitationCode: 'GAF-006' },
  { name: 'Mdhilla',           governorate: 'Gafsa',     invitationCode: 'GAF-007' },
  { name: 'Redeyef',           governorate: 'Gafsa',     invitationCode: 'GAF-008' },
  { name: 'Moularès',          governorate: 'Gafsa',     invitationCode: 'GAF-009' },
  { name: 'Belkhir',           governorate: 'Gafsa',     invitationCode: 'GAF-010' },
  { name: 'Sened',             governorate: 'Gafsa',     invitationCode: 'GAF-011' },

  // ── Tozeur ──────────────────────────────────────────────────
  { name: 'Tozeur',            governorate: 'Tozeur',    invitationCode: 'TOZ-001' },
  { name: 'Degache',           governorate: 'Tozeur',    invitationCode: 'TOZ-002' },
  { name: 'Tamerza',           governorate: 'Tozeur',    invitationCode: 'TOZ-003' },
  { name: 'Hazoua',            governorate: 'Tozeur',    invitationCode: 'TOZ-004' },
  { name: 'Nefta',             governorate: 'Tozeur',    invitationCode: 'TOZ-005' },

  // ── Kébili ──────────────────────────────────────────────────
  { name: 'Kébili Nord',       governorate: 'Kébili',    invitationCode: 'KEB-001' },
  { name: 'Kébili Sud',        governorate: 'Kébili',    invitationCode: 'KEB-002' },
  { name: 'Souk Lahad',        governorate: 'Kébili',    invitationCode: 'KEB-003' },
  { name: 'Douz Nord',         governorate: 'Kébili',    invitationCode: 'KEB-004' },
  { name: 'Douz Sud',          governorate: 'Kébili',    invitationCode: 'KEB-005' },
  { name: 'El Faouar',         governorate: 'Kébili',    invitationCode: 'KEB-006' },
];

async function seed() {
  try {
    // Connect to MongoDB using your existing config
    await mongoose.connect(process.env.Url_MongoDB || process.env.Url_MongoDB);
    console.log('✅ Connected to MongoDB');

    // Clear existing municipalities to avoid duplicates
    await Municipality.deleteMany({});
    console.log('🗑️  Cleared existing municipalities');

    // Insert all municipalities
    const inserted = await Municipality.insertMany(municipalities);
    console.log(`✅ Inserted ${inserted.length} municipalities across 24 governorates`);

    // Summary by governorate
    const summary = municipalities.reduce((acc, m) => {
      acc[m.governorate] = (acc[m.governorate] || 0) + 1;
      return acc;
    }, {});
    console.log('\n📊 Summary:');
    Object.entries(summary).forEach(([gov, count]) => {
      console.log(`   ${gov}: ${count} municipalities`);
    });

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();