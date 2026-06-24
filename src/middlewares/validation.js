const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
// Siempre incluye un "message" específico con el primer campo que falló,
// además del listado completo en "errors" para depuración.
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const listaErrores = errors.array();
    const primerError = listaErrores[0];
    return res.status(400).json({
      success: false,
      message: `El campo '${primerError.path || primerError.param}' es inválido: ${primerError.msg}`,
      errors: listaErrores
    });
  }
  next();
};

// Validaciones comunes
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin
};