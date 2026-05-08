const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const { Users, Roles } = require('../models');

const router = express.Router();

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

// Login
router.post('/login', validateLogin, async (req, res) => {
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

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        role: user.Role.role_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_user,
        full_name: user.full_name,
        email: user.email,
        role: user.Role.role_name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registro (solo para administradores)
router.post('/register', validateRegister, async (req, res) => {
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

module.exports = router;