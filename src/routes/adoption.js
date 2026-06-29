const express = require('express');
const { getAdoptionRequests, getAdoptionStats } = require('../controllers/adoptionController');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

const ROLES_ADOPCION = ['administrador', 'operador'];

// IMPORTANTE: '/stats' antes de cualquier ruta con :id (hoy no hay, pero
// se deja el orden correcto para cuando se agregue GET /:id).
router.get('/', verifyToken, checkRole(ROLES_ADOPCION), getAdoptionRequests);
router.get('/stats', verifyToken, checkRole(ROLES_ADOPCION), getAdoptionStats);

module.exports = router;
