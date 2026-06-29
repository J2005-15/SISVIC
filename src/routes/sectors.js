const express = require('express');
const { getSectors, getSector, createSector, updateSector, deleteSector } = require('../controllers/sectorsController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear sector
const validateCreateSector = [
  body('community_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre de la comunidad es requerido'),
  body('parish')
    .trim()
    .isLength({ min: 1 })
    .withMessage('La parroquia es requerida'),
  body('municipality')
    .optional()
    .trim(),
  handleValidationErrors
];

// Rutas
router.get('/', getSectors);
router.get('/:id', getSector);
router.post('/', verifyToken, checkRole(['administrador']), validateCreateSector, createSector);
router.put('/:id', verifyToken, checkRole(['administrador']), validateCreateSector, updateSector);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteSector);

module.exports = router;