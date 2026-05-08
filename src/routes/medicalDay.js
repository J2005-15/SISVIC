const express = require('express');
const { body, param } = require('express-validator');
const { getMedicalDays, getMedicalDay, createMedicalDay, updateMedicalDay, deleteMedicalDay } = require('../controllers/medicalDayController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateMedicalDay = [
  body('day_name').trim().isLength({ min: 1 }).withMessage('Nombre del día es requerido'),
  body('id_sector').isInt().withMessage('ID de sector inválido'),
  body('date_event').isISO8601().withMessage('Fecha inválida'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descripción requerida'),
  handleValidationErrors
];

const validateMedicalDayId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', authenticateToken, getMedicalDays);
router.get('/:id', authenticateToken, validateMedicalDayId, getMedicalDay);
router.post('/', authenticateToken, authorizeRoles('admin'), validateMedicalDay, createMedicalDay);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateMedicalDayId, validateMedicalDay, updateMedicalDay);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateMedicalDayId, deleteMedicalDay);

module.exports = router;