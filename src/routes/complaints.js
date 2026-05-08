const express = require('express');
const { body, param } = require('express-validator');
const { getComplaints, getComplaint, createComplaint, updateComplaint, deleteComplaint } = require('../controllers/complaintsController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateComplaint = [
  body('id_animal').optional().isInt().withMessage('ID de animal inválido'),
  body('id_sector').optional().isInt().withMessage('ID de sector inválido'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descripción requerida'),
  body('priority').isIn(['Baja', 'Media', 'Alta', 'Urgente']).withMessage('Prioridad inválida'),
  body('status').isIn(['Recibida', 'En_Investigación', 'Resuelta', 'Desestimada']).withMessage('Estado inválido'),
  handleValidationErrors
];

const validateComplaintId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', authenticateToken, getComplaints);
router.get('/:id', authenticateToken, validateComplaintId, getComplaint);
router.post('/', authenticateToken, authorizeRoles('admin'), validateComplaint, createComplaint);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateComplaintId, validateComplaint, updateComplaint);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateComplaintId, deleteComplaint);

module.exports = router;