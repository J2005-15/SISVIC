const express = require('express');
const { getRoles, getRole } = require('../controllers/rolesController');
const { param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', getRoles);
router.get('/:id', validateId, getRole);

module.exports = router;