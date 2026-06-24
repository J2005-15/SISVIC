const express = require('express');
const {
  getSupplyStocks,
  getSupplyStock,
  createSupplyStock,
  updateSupplyStock,
  deleteSupplyStock,
  patchSupplyStock,
  getSupplyHistory
} = require('../controllers/supplyStockController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Roles con permiso de escritura sobre el módulo de Inventario
const ROLES_INVENTARIO = ['administrador', 'operador'];

// Validación completa para crear/actualizar suministro (POST y PUT)
// Los campos realmente opcionales usan optional({ checkFalsy: true }) para que
// un '' (string vacío, como llega desde un <select> o <input> sin valor) no
// dispare la validación — por defecto .optional() solo ignora 'undefined'.
const validateCreateSupplyStock = [
  body('material_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre del material es requerido'),
  body('category')
    .isIn(['Vacuna', 'Antibiótico', 'Desparasitante', 'Material_Médico', 'Otro'])
    .withMessage('Categoría inválida'),
  body('current_quantity')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('measurement_unit')
    .isIn(['Unidad', 'ML', 'MG', 'Frasco', 'Caja'])
    .withMessage('Unidad de medida inválida'),
  body('min_stock')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero positivo'),
  body('batch_number')
    .optional({ checkFalsy: true })
    .trim(),
  body('expiration_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Fecha de expiración inválida'),
  handleValidationErrors
];

// Rutas GET — /history/:id debe ir ANTES de /:id para evitar conflicto de rutas en Express
// Lectura: cualquier usuario autenticado (sin restricción de rol)
router.get('/',            verifyToken, getSupplyStocks);
router.get('/history/:id', verifyToken, getSupplyHistory);
router.get('/:id',         verifyToken, getSupplyStock);

// Escritura — requiere autenticación + rol 'administrador' u 'operador'
router.post('/',   verifyToken, checkRole(ROLES_INVENTARIO), validateCreateSupplyStock, createSupplyStock);
router.put('/:id', verifyToken, checkRole(ROLES_INVENTARIO), validateCreateSupplyStock, updateSupplyStock);

// PATCH solo actualiza current_quantity y registra el movimiento (no requiere validación completa)
router.patch('/:id', verifyToken, checkRole(ROLES_INVENTARIO), patchSupplyStock);

router.delete('/:id', verifyToken, checkRole(ROLES_INVENTARIO), deleteSupplyStock);

module.exports = router;
