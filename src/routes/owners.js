const express = require('express');
const { getOwners, getOwner, createOwner, updateOwner, deleteOwner } = require('../controllers/ownersController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear propietario
const validateCreateOwner = [
  body('full_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre completo es requerido'),
  body('id_card')
    .trim()
    .isLength({ min: 1 })
    .withMessage('La cédula es requerida'),
  body('phone_number')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El número de teléfono es requerido'),
  body('address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('La dirección es requerida'),
  body('id_sector')
    .isInt()
    .withMessage('El sector es requerido'),
  handleValidationErrors
];

// Rutas
router.get('/', getOwners);
router.get('/:id', getOwner);
router.post('/', authenticateToken, authorizeRoles('admin'), validateCreateOwner, createOwner);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateCreateOwner, updateOwner);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteOwner);

module.exports = router;