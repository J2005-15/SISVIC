const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

// ─── MIDDLEWARE 1: VERIFICACIÓN DE TOKEN JWT ─────────────────────────────────
// Extrae y valida el Bearer token del header Authorization
const verifyToken = (req, res, next) => {
  // Obtener header authorization (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Validar que el header existe y tiene formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado o formato inválido. Use: Authorization: Bearer <token>'
    });
  }

  // Extraer solo la cadena JWT (quitar "Bearer " del inicio)
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token vacío. Proporcione un token JWT válido.'
    });
  }

  // Verificar y decodificar el JWT
  jwt.verify(token, env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      console.error('Error en verificación de JWT:', err.message);

      // Diferenciar entre token expirado e inválido
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor, vuelva a iniciar sesión.'
        });
      }

      return res.status(403).json({
        success: false,
        message: 'Token inválido o corrupto.'
      });
    }

    // Guardar el usuario decodificado en la request para los siguientes middlewares
    req.user = decodedUser;
    next();
  });
};

// ─── MIDDLEWARE 2: VERIFICACIÓN DE ROLES ──────────────────────────────────────
// Valida que el usuario tiene uno de los roles permitidos
// Parámetro: array de strings de roles permitidos
// Ejemplo: checkRole(['administrador', 'veterinario'])
const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    // Validar que el usuario está autenticado (debe estar seteado por verifyToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Extraer el rol del usuario del payload del JWT
    // La propiedad es 'role' según el payload del login
    const userRole = req.user?.role;

    if (!userRole) {
      console.error('JWT sin propiedad role:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Token inválido: rol no encontrado'
      });
    }

    // Validar que el rol del usuario está en la lista de roles permitidos
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Tu rol '${userRole}' no tiene permisos. Roles permitidos: ${rolesPermitidos.join(', ')}`
      });
    }

    // Usuario autenticado y autorizado
    next();
  };
};

// Exportar middlewares con nombres claros
module.exports = {
  verifyToken,        // Middleware de autenticación (valida JWT)
  checkRole,          // Middleware de autorización (valida roles)

  // Alias para compatibilidad con código anterior
  authenticateToken: verifyToken,
  authorizeRoles: (rolesArray) => checkRole(rolesArray)
};
