const express = require('express');
const { getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = require('../controllers/medicalRecordsController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Lectura: administrador y veterinario pueden consultar el historial médico.
// Escritura (POST/PUT/DELETE): ÚNICAMENTE veterinario — el administrador
// gestiona personal/inventario/usuarios, pero no es quien atiende al paciente,
// así que no debe poder crear, editar ni eliminar consultas médicas.
const ROLES_LECTURA_CONSULTAS  = ['administrador', 'veterinario'];
const ROLES_ESCRITURA_CONSULTAS = ['veterinario'];

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
  body('used_supplies')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Los insumos utilizados deben ser un arreglo'),
  body('used_supplies.*.id_supply')
    .optional()
    .isInt()
    .withMessage('ID de insumo inválido'),
  body('used_supplies.*.used_quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cantidad de insumo inválida'),
  handleValidationErrors
];

// Rutas
router.get('/', verifyToken, checkRole(ROLES_LECTURA_CONSULTAS), getMedicalRecords);
router.get('/:id', verifyToken, checkRole(ROLES_LECTURA_CONSULTAS), getMedicalRecord);
router.post('/', verifyToken, checkRole(ROLES_ESCRITURA_CONSULTAS), validateCreateMedicalRecord, createMedicalRecord);
router.put('/:id', verifyToken, checkRole(ROLES_ESCRITURA_CONSULTAS), validateCreateMedicalRecord, updateMedicalRecord);
router.delete('/:id', verifyToken, checkRole(ROLES_ESCRITURA_CONSULTAS), deleteMedicalRecord);

module.exports = router;