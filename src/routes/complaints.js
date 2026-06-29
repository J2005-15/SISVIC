const express = require('express');
const { body, param } = require('express-validator');
const { getComplaints, getComplaintStats, getComplaint, createComplaint, updateComplaint, deleteComplaint } = require('../controllers/complaintsController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Acceso alineado con Sidebar.jsx: 'denuncias' solo es visible para
// administrador y operador (ni veterinario ni viewer ven este módulo).
const ROLES_DENUNCIAS = ['administrador', 'operador'];

const validateComplaint = [
  body('id_animal').optional({ checkFalsy: true }).isInt().withMessage('ID de animal inválido'),
  body('id_sector').optional({ checkFalsy: true }).isInt().withMessage('ID de sector inválido'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descripción requerida'),
  body('priority').isIn(['Baja', 'Media', 'Alta', 'Urgente']).withMessage('Prioridad inválida'),
  body('status').isIn(['Recibida', 'En_Investigación', 'Resuelta', 'Desestimada']).withMessage('Estado inválido'),
  handleValidationErrors
];

const validateComplaintId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

// IMPORTANTE: '/stats' debe declararse ANTES de '/:id' — si no, Express
// interpretaría "stats" como si fuera el valor de :id.
router.get('/stats', verifyToken, checkRole(ROLES_DENUNCIAS), getComplaintStats);
router.get('/', verifyToken, checkRole(ROLES_DENUNCIAS), getComplaints);
router.get('/:id', verifyToken, checkRole(ROLES_DENUNCIAS), validateComplaintId, getComplaint);
router.post('/', verifyToken, checkRole(ROLES_DENUNCIAS), validateComplaint, createComplaint);
router.put('/:id', verifyToken, checkRole(ROLES_DENUNCIAS), validateComplaintId, validateComplaint, updateComplaint);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateComplaintId, deleteComplaint);

module.exports = router;