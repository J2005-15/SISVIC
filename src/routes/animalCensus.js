const express = require('express');
const { getAnimalCensuses, getAnimalCensus, createAnimalCensus, updateAnimalCensus, deleteAnimalCensus } = require('../controllers/animalCensusController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear censo de animal
// IMPORTANTE: los campos realmente opcionales usan optional({ checkFalsy: true })
// para que un '' (string vacío, como llega desde un <select> o <input> sin valor)
// no dispare la validación — por defecto .optional() solo ignora 'undefined'.
const validateCreateAnimalCensus = [
  body('species')
    .isIn(['Canino', 'Felino', 'Otro'])
    .withMessage('Especie inválida'),
  body('gender')
    .isIn(['M', 'H'])
    .withMessage('Género inválido'),
  body('color')
    .optional({ checkFalsy: true })
    .isIn(['Negro', 'Blanco', 'Marron', 'Gris', 'Dorado', 'Manchado', 'Bicolor', 'Tricolor'])
    .withMessage('Color inválido'),
  body('id_owner')
    .isInt()
    .withMessage('El propietario es requerido'),
  body('id_sector')
    .isInt()
    .withMessage('El sector es requerido'),
  body('census_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Fecha de censo inválida'),
  body('symptoms')
    .optional({ checkFalsy: true })
    .trim(),
  handleValidationErrors
];

// Rutas
router.get('/', verifyToken, getAnimalCensuses);
router.get('/:id', verifyToken, getAnimalCensus);
router.post('/', verifyToken, validateCreateAnimalCensus, createAnimalCensus);
router.put('/:id', verifyToken, validateCreateAnimalCensus, updateAnimalCensus);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteAnimalCensus);

module.exports = router;