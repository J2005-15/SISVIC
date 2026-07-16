const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { limitadorLogin, limitadorEmail } = require('../middlewares/rateLimiter');
const { Users, Roles } = require('../models');
const emailService = require('../services/emailService');
const { env } = require('../config/env');

const router = express.Router();

// Función para generar contraseña aleatoria
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
};

// Validación para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validación para registro
const validateRegister = [
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
  handleValidationErrors
];

// Validación para recuperar contraseña
const validateRecoverPassword = [
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  handleValidationErrors
];

// Login
router.post('/login', limitadorLogin, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await Users.findOne({
      where: { email },
      include: [{ model: Roles, as: 'Role' }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'activo') {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    // Normalizar nombre del rol (corregir typo "adminiatrador" → "administrador")
    const normalizeRoleName = (roleName) => {
      if (!roleName) return 'operador';
      const normalized = roleName.toLowerCase().trim();
      if (normalized === 'adminiatrador') return 'administrador';
      return normalized;
    };

    const rolNormalizado = normalizeRoleName(user.Role.role_name);

    // Generar token JWT con ID y nombre del rol
    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        id_role: user.id_role,           // ID numérico del rol (1, 2, 3)
        role: rolNormalizado              // Nombre normalizado del rol
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      usuario: {
        id_user: user.id_user,
        id_role: user.id_role,
        full_name: user.full_name,
        email: user.email,
        nombre: user.full_name,
        rol: rolNormalizado
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registro (solo para administradores autenticados)
router.post('/register', authenticateToken, authorizeRoles([1]), validateRegister, async (req, res) => {
  try {
    const { full_name, email, password, id_role } = req.body;

    // Verificar si el email ya existe
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar que el rol existe
    const role = await Roles.findByPk(id_role);
    if (!role) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await Users.create({
      full_name,
      email,
      password: hashedPassword,
      id_role,
      status: 'activo'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id_user,
        full_name: newUser.full_name,
        email: newUser.email,
        role: role.role_name
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Recuperar contraseña
router.post('/recover-password', limitadorEmail, validateRecoverPassword, async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: 'No existe una cuenta asociada a este email'
      });
    }

    // Generar nueva contraseña aleatoria
    const newPassword = generateRandomPassword();

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña en la BD
    await user.update({ password: hashedPassword });

    // Enviar email con la nueva contraseña
    const emailSent = await emailService.sendPasswordResetEmail(email, newPassword);

    if (!emailSent) {
      return res.status(500).json({
        message: 'Error al enviar el email. Por favor intenta más tarde.'
      });
    }

    res.json({
      message: 'Se ha enviado una nueva contraseña a tu email. Por favor revisa tu correo.',
      note: 'En desarrollo, la contraseña también aparece en los logs de consola'
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;