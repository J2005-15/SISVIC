const express = require('express');
const { getOwners, getOwner, createOwner, updateOwner, deleteOwner } = require('../controllers/ownersController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// ─── VALIDACIONES DE ENTRADA ────────────────────────────────────────────────────

const validateOwner = [
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

// ─── RUTAS PROTEGIDAS (requieren autenticación + roles) ────────────────────────

// GET /api/owners
router.get('/', verifyToken, getOwners);

// GET /api/owners/:id
router.get('/:id', verifyToken, getOwner);

// POST /api/owners
// Acceso: 'administrador', 'veterinario' y 'operador'
router.post(
  '/',
  verifyToken,
  checkRole(['administrador', 'veterinario', 'operador']),
  validateOwner,
  createOwner
);

// PUT /api/owners/:id
// Acceso: 'administrador', 'veterinario' y 'operador'
router.put(
  '/:id',
  verifyToken,
  checkRole(['administrador', 'veterinario', 'operador']),
  validateOwner,
  updateOwner
);

// DELETE /api/owners/:id
// Descripción: Eliminar propietario (solo administrador)
// Acceso: Solo 'administrador'
// Flujo: verifyToken → checkRole → deleteOwner
router.delete(
  '/:id',
  verifyToken,
  checkRole(['administrador']),
  deleteOwner
);

module.exports = router;
