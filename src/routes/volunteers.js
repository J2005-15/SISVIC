const express = require('express');
const { body, param } = require('express-validator');
const {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
} = require('../controllers/volunteersController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateVolunteer = [
  body('first_name').trim().isLength({ min: 1 }).withMessage('Nombre es requerido'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Apellido es requerido'),
  body('dni_number').trim().isLength({ min: 1 }).withMessage('DNI es requerido'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Teléfono es requerido'),
  body('volunteer_type')
    .isIn(['Rescates', 'Rehabilitación', 'Apoyo en Jornadas', 'Educación Comunitaria', 'Campañas de Incidencia', 'Capacitación'])
    .withMessage('Área de voluntariado inválida'),
  handleValidationErrors
];

const validateVolunteerId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

// Lectura: cualquier usuario autenticado. Escritura: únicamente administrador.
router.get('/', verifyToken, getVolunteers);
router.get('/:id', verifyToken, validateVolunteerId, getVolunteer);
router.post('/', verifyToken, checkRole(['administrador']), validateVolunteer, createVolunteer);
router.put('/:id', verifyToken, checkRole(['administrador']), validateVolunteerId, validateVolunteer, updateVolunteer);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateVolunteerId, deleteVolunteer);

module.exports = router;
