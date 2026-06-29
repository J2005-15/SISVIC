const express = require('express');
const { getDonations, getDonationStats } = require('../controllers/donationsController');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

// Mismos roles que ven 'Colaboraciones' en Sidebar.jsx
const ROLES_COLABORACIONES = ['administrador', 'operador'];

// IMPORTANTE: '/stats' antes de cualquier ruta con :id (hoy no hay, pero
// se deja el orden correcto para cuando se agregue GET /:id).
router.get('/stats', verifyToken, checkRole(ROLES_COLABORACIONES), getDonationStats);
router.get('/', verifyToken, checkRole(ROLES_COLABORACIONES), getDonations);

module.exports = router;
