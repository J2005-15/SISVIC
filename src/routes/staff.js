const express = require('express');
const { body, param } = require('express-validator');
const {
  getStaff,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
} = require('../controllers/staffController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateStaff = [
  body('first_name').trim().isLength({ min: 1 }).withMessage('Nombre es requerido'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Apellido es requerido'),
  body('dni_number').trim().isLength({ min: 1 }).withMessage('DNI es requerido'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Teléfono es requerido'),
  body('staff_type')
    .isIn(['Veterinario', 'Asistente', 'Logística', 'Captador', 'Otro'])
    .withMessage('Tipo de personal inválido'),
  handleValidationErrors
];

const validateStaffId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

// Lectura: cualquier usuario autenticado. Escritura: únicamente administrador.
router.get('/', verifyToken, getStaff);
router.get('/:id', verifyToken, validateStaffId, getStaffMember);
router.post('/', verifyToken, checkRole(['administrador']), validateStaff, createStaffMember);
router.put('/:id', verifyToken, checkRole(['administrador']), validateStaffId, validateStaff, updateStaffMember);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateStaffId, deleteStaffMember);

module.exports = router;
