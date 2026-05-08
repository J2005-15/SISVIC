const express = require('express');
const { body, param } = require('express-validator');
const { getUsedSupplies, getUsedSupply, createUsedSupply, updateUsedSupply, deleteUsedSupply } = require('../controllers/usedSuppliesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateUsedSupply = [
  body('id_record').optional().isInt().withMessage('ID de registro inválido'),
  body('id_supply').isInt().withMessage('ID de suministro inválido'),
  body('used_quantity').isInt({ min: 1 }).withMessage('Cantidad utilizada inválida'),
  handleValidationErrors
];

const validateUsedSupplyId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', authenticateToken, getUsedSupplies);
router.get('/:id', authenticateToken, validateUsedSupplyId, getUsedSupply);
router.post('/', authenticateToken, authorizeRoles('admin'), validateUsedSupply, createUsedSupply);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateUsedSupplyId, validateUsedSupply, updateUsedSupply);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateUsedSupplyId, deleteUsedSupply);

module.exports = router;