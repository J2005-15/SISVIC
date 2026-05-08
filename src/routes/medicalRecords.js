const express = require('express');
const { getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = require('../controllers/medicalRecordsController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear registro médico
const validateCreateMedicalRecord = [
  body('consultation_reason')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El motivo de consulta es requerido'),
  body('diagnosis')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El diagnóstico es requerido'),
  body('treatment')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El tratamiento es requerido'),
  body('id_animal')
    .optional()
    .isInt()
    .withMessage('Animal inválido'),
  body('id_vet_user')
    .optional()
    .isInt()
    .withMessage('Veterinario inválido'),
  body('id_day')
    .optional()
    .isInt()
    .withMessage('Día médico inválido'),
  body('weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Peso inválido'),
  body('temperature')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Temperatura inválida'),
  handleValidationErrors
];

// Rutas
router.get('/', authenticateToken, getMedicalRecords);
router.get('/:id', authenticateToken, getMedicalRecord);
router.post('/', authenticateToken, validateCreateMedicalRecord, createMedicalRecord);
router.put('/:id', authenticateToken, validateCreateMedicalRecord, updateMedicalRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteMedicalRecord);

module.exports = router;