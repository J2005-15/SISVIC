const express = require('express');
const { body, param } = require('express-validator');
const { getMedicalDays, getMedicalDay, createMedicalDay, updateMedicalDay, deleteMedicalDay } = require('../controllers/medicalDayController');
const { verifyToken, checkRole } = require('../middlewares/auth');
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

router.get('/', verifyToken, getMedicalDays);
router.get('/:id', verifyToken, validateMedicalDayId, getMedicalDay);
router.post('/', verifyToken, checkRole(['administrador']), validateMedicalDay, createMedicalDay);
router.put('/:id', verifyToken, checkRole(['administrador']), validateMedicalDayId, validateMedicalDay, updateMedicalDay);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateMedicalDayId, deleteMedicalDay);

module.exports = router;