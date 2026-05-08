// Funciones de utilidad

// Generar un token aleatorio
const generateRandomToken = (length = 32) => {
  return require('crypto').randomBytes(length).toString('hex');
};

// Validar email con regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Capitalizar primera letra
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Limpiar objeto (remover propiedades undefined/null)
const cleanObject = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] != null) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

module.exports = {
  generateRandomToken,
  isValidEmail,
  capitalize,
  formatDate,
  cleanObject
};