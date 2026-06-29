const express = require('express');
const { getBitacora } = require('../controllers/bitacoraController');
const { verifyToken, checkRole } = require('../middlewares/auth');

const router = express.Router();

// Solo administrador puede ver la bitácora — es información sensible
// sobre la actividad de todos los usuarios del sistema.
router.get('/', verifyToken, checkRole(['administrador']), getBitacora);

module.exports = router;
