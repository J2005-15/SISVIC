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

// ─── RUTAS PÚBLICAS (sin autenticación) ──────────────────────────────────────

// GET /api/owners
// Descripción: Listar todos los propietarios
// Acceso: Público (para Censo Animal y otras vistas)
router.get('/', getOwners);

// GET /api/owners/:id
// Descripción: Obtener propietario específico por ID
// Acceso: Público
router.get('/:id', getOwner);

// ─── RUTAS PROTEGIDAS (requieren autenticación + roles) ────────────────────────

// POST /api/owners
// Descripción: Crear nuevo propietario
// Acceso: Solo 'administrador' y 'veterinario'
// Flujo: verifyToken → checkRole → validateOwner → createOwner
router.post(
  '/',
  verifyToken,
  checkRole(['administrador', 'veterinario']),
  validateOwner,
  createOwner
);

// PUT /api/owners/:id
// Descripción: Actualizar propietario existente
// Acceso: Solo 'administrador' y 'veterinario'
// Flujo: verifyToken → checkRole → validateOwner → updateOwner
router.put(
  '/:id',
  verifyToken,
  checkRole(['administrador', 'veterinario']),
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
