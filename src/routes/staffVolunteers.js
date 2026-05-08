const express = require('express');
const { body, param } = require('express-validator');
const { getStaffVolunteers, getStaffVolunteer, createStaffVolunteer, updateStaffVolunteer, deleteStaffVolunteer } = require('../controllers/staffVolunteersController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateStaffVolunteer = [
  body('first_name').trim().isLength({ min: 1 }).withMessage('Nombre es requerido'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Apellido es requerido'),
  body('dni_number').trim().isLength({ min: 1 }).withMessage('DNI es requerido'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Teléfono es requerido'),
  body('staff_type').isIn(['Veterinario', 'Asistente', 'Logística', 'Captador', 'Otro']).withMessage('Tipo de staff inválido'),
  handleValidationErrors
];

const validateStaffVolunteerId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', authenticateToken, getStaffVolunteers);
router.get('/:id', authenticateToken, validateStaffVolunteerId, getStaffVolunteer);
router.post('/', authenticateToken, authorizeRoles('admin'), validateStaffVolunteer, createStaffVolunteer);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateStaffVolunteerId, validateStaffVolunteer, updateStaffVolunteer);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateStaffVolunteerId, deleteStaffVolunteer);

module.exports = router;