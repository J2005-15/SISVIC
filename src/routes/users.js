const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validación para crear usuario
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

// Rutas
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUser);
router.post('/', authenticateToken, authorizeRoles('admin'), validateCreateUser, createUser);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateCreateUser, updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

module.exports = router;