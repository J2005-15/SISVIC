const express = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const { getProfile, updateProfile } = require('../controllers/usersController');

const router = express.Router();

// Validación para actualizar el perfil (manteniendo los estándares de tu API)
const validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre completo no puede estar vacío'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  handleValidationErrors
];

/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Gestión del perfil del usuario autenticado
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener los datos del usuario en sesión
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     Role:
 *                       type: object
 *                       properties:
 *                         id_role:
 *                           type: integer
 *                         role_name:
 *                           type: string
 *       401:
 *         description: Token no provisto o inválido
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/profile_update:
 *   put:
 *     summary: Actualizar datos del usuario en sesión (nombre y/o email)
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         description: Error de validación o email ya en uso
 */
router.put('/profile_update', authenticateToken, validateProfileUpdate, updateProfile);

module.exports = router;