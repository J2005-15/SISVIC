const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const requiredEnvVars = [
  'DB_ENV',
  'PORT',
  'JWT_SECRET'
];

// Función para validar variables de entorno
function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
  }

  // Validar DB_ENV
  if (!['local', 'remote'].includes(process.env.DB_ENV)) {
    throw new Error('DB_ENV debe ser "local" o "remote"');
  }

  console.log('Variables de entorno validadas correctamente.');
}

module.exports = {
  validateEnv,
  env: process.env
};