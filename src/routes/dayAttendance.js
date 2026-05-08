const express = require('express');
const { body, param } = require('express-validator');
const { getDayAttendances, getDayAttendance, createDayAttendance, updateDayAttendance, deleteDayAttendance } = require('../controllers/dayAttendanceController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateDayAttendance = [
  body('id_day').isInt().withMessage('ID de día inválido'),
  body('id_owner').isInt().withMessage('ID de propietario inválido'),
  body('id_staff').isInt().withMessage('ID de staff inválido'),
  body('id_animal').optional().isInt().withMessage('ID de animal inválido'),
  body('arrival_time').optional().isISO8601().withMessage('Fecha/hora inválida'),
  handleValidationErrors
];

const validateDayAttendanceId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', authenticateToken, getDayAttendances);
router.get('/:id', authenticateToken, validateDayAttendanceId, getDayAttendance);
router.post('/', authenticateToken, authorizeRoles('admin'), validateDayAttendance, createDayAttendance);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateDayAttendanceId, validateDayAttendance, updateDayAttendance);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validateDayAttendanceId, deleteDayAttendance);

module.exports = router;