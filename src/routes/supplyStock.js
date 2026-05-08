const express = require('express');
const { getSupplyStocks, getSupplyStock, createSupplyStock, updateSupplyStock, deleteSupplyStock } = require('../controllers/supplyStockController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear suministro
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
  body('batch_number')
    .optional()
    .trim(),
  body('expiration_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración inválida'),
  handleValidationErrors
];

// Rutas
router.get('/', authenticateToken, getSupplyStocks);
router.get('/:id', authenticateToken, getSupplyStock);
router.post('/', authenticateToken, authorizeRoles('admin'), validateCreateSupplyStock, createSupplyStock);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateCreateSupplyStock, updateSupplyStock);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSupplyStock);

module.exports = router;