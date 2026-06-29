const express = require('express');
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
  changePassword, forgotPassword, resetPassword
} = require('../controllers/usersController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear usuario — password obligatoria
const validateCreateUser = [
  body('full_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre completo es requerido'),
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('id_role')
    .isInt()
    .withMessage('El rol es requerido'),
  body('status')
    .isIn(['activo', 'inactivo', 'suspendido'])
    .withMessage('Estado inválido'),
  handleValidationErrors
];

// Validación para actualizar usuario — password OPCIONAL.
// optional({ checkFalsy: true }) le dice a express-validator que si el campo
// viene ausente, null o '' (string vacío), no aplique la regla de isLength.
// Si el usuario SÍ envía una contraseña nueva, se sigue exigiendo el mínimo.
const validateUpdateUser = [
  body('full_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre completo es requerido'),
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('id_role')
    .isInt()
    .withMessage('El rol es requerido'),
  body('status')
    .isIn(['activo', 'inactivo', 'suspendido'])
    .withMessage('Estado inválido'),
  handleValidationErrors
];

// Validación: cambio de contraseña del propio usuario autenticado
const validateChangePassword = [
  body('current_password')
    .notEmpty()
    .withMessage('Debe indicar su contraseña actual'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validación: solicitud de recuperación (solo requiere un email válido)
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  handleValidationErrors
];

// Validación: restablecimiento con token recibido por correo
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token requerido'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// ─── RUTAS DE SEGURIDAD ──────────────────────────────────────────────────────
// IMPORTANTE: deben declararse ANTES de '/:id' — si no, Express interpretaría
// "change-password" como si fuera el valor de :id y nunca llegarían aquí.
router.put('/change-password', verifyToken, validateChangePassword, changePassword);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Lectura: cualquier usuario autenticado. Escritura: únicamente administrador.
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUser);
router.post('/', verifyToken, checkRole(['administrador']), validateCreateUser, createUser);
router.put('/:id', verifyToken, checkRole(['administrador']), validateUpdateUser, updateUser);
router.delete('/:id', verifyToken, checkRole(['administrador']), deleteUser);

module.exports = router;