const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const propietariosController = require('../controllers/propietariosController');

const router = express.Router();

// ─── RUTAS PARA GESTIÓN DE PROPIETARIOS ─────────────────────────────────────
// Todas las rutas requieren autenticación JWT

// GET - Listar todos los propietarios
// Acceso: Todos los roles autenticados (administrador, veterinario, operador)
router.get('/', authenticateToken, propietariosController.getAll);

// GET - Obtener propietario por ID
// Acceso: Todos los roles autenticados
router.get('/:id', authenticateToken, propietariosController.getById);

// POST - Crear nuevo propietario
// Acceso: Solo administrador y veterinario
router.post('/', authenticateToken, authorizeRoles([1, 2]), propietariosController.create);

// PUT - Actualizar propietario
// Acceso: Solo administrador y veterinario
router.put('/:id', authenticateToken, authorizeRoles([1, 2]), propietariosController.update);

// DELETE - Eliminar propietario
// Acceso: Solo administrador
router.delete('/:id', authenticateToken, authorizeRoles([1]), propietariosController.delete);

module.exports = router;
