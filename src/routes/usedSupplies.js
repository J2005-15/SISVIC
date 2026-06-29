const express = require('express');
const { body, param } = require('express-validator');
const { getUsedSupplies, getUsedSupply, createUsedSupply, updateUsedSupply, deleteUsedSupply } = require('../controllers/usedSuppliesController');
const { verifyToken, checkRole } = require('../middlewares/auth');
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

router.get('/', verifyToken, getUsedSupplies);
router.get('/:id', verifyToken, validateUsedSupplyId, getUsedSupply);
router.post('/', verifyToken, checkRole(['administrador']), validateUsedSupply, createUsedSupply);
router.put('/:id', verifyToken, checkRole(['administrador']), validateUsedSupplyId, validateUsedSupply, updateUsedSupply);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateUsedSupplyId, deleteUsedSupply);

module.exports = router;