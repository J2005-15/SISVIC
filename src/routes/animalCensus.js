const express = require('express');
const { getAnimalCensuses, getAnimalCensus, createAnimalCensus, updateAnimalCensus, deleteAnimalCensus } = require('../controllers/animalCensusController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear censo de animal
const validateCreateAnimalCensus = [
  body('species')
    .isIn(['Canino', 'Felino', 'Otro'])
    .withMessage('Especie inválida'),
  body('gender')
    .isIn(['M', 'H'])
    .withMessage('Género inválido'),
  body('color')
    .optional()
    .isIn(['Negro', 'Blanco', 'Marron', 'Gris', 'Dorado', 'Manchado', 'Bicolor', 'Tricolor'])
    .withMessage('Color inválido'),
  body('id_owner')
    .isInt()
    .withMessage('El propietario es requerido'),
  body('id_sector')
    .optional()
    .isInt()
    .withMessage('Sector inválido'),
  handleValidationErrors
];

// Rutas
router.get('/', getAnimalCensuses);
router.get('/:id', getAnimalCensus);
router.post('/', authenticateToken, validateCreateAnimalCensus, createAnimalCensus);
router.put('/:id', authenticateToken, validateCreateAnimalCensus, updateAnimalCensus);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteAnimalCensus);

module.exports = router;