const express = require('express');
const { body, param } = require('express-validator');
const { getDayAttendances, getDayAttendance, createDayAttendance, updateDayAttendance, deleteDayAttendance } = require('../controllers/dayAttendanceController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

const validateDayAttendance = [
  body('id_day').isInt().withMessage('ID de día inválido'),
  body('id_owner').isInt().withMessage('ID de propietario inválido'),
  body('id_staff').optional({ checkFalsy: true }).isInt().withMessage('ID de personal inválido'),
  body('id_volunteer').optional({ checkFalsy: true }).isInt().withMessage('ID de voluntario inválido'),
  body('id_animal').optional({ checkFalsy: true }).isInt().withMessage('ID de animal inválido'),
  body('arrival_time').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha/hora inválida'),
  handleValidationErrors
];

const validateDayAttendanceId = [
  param('id').isInt().withMessage('ID inválido'),
  handleValidationErrors
];

router.get('/', verifyToken, getDayAttendances);
router.get('/:id', verifyToken, validateDayAttendanceId, getDayAttendance);
router.post('/', verifyToken, checkRole(['administrador']), validateDayAttendance, createDayAttendance);
router.put('/:id', verifyToken, checkRole(['administrador']), validateDayAttendanceId, validateDayAttendance, updateDayAttendance);
router.delete('/:id', verifyToken, checkRole(['administrador']), validateDayAttendanceId, deleteDayAttendance);

module.exports = router;