const { Bitacora } = require('../models');

/**
 * Registra una entrada de auditoría. Se llama explícitamente desde cada
 * controlador, justo después de que la acción principal tuvo éxito —
 * un helper genérico vía middleware no puede producir una "description"
 * útil porque no conoce el contexto semántico de cada módulo.
 *
 * Nunca lanza: si falla la escritura en Bitacora, se loggea a consola pero
 * NO se interrumpe la respuesta de la petición original.
 *
 * @param {Object} datos
 * @param {number|null} datos.id_user        - req.user.id del token JWT
 * @param {'crear'|'actualizar'|'eliminar'|'cambio_estado'} datos.action
 * @param {string} datos.table_affected      - ej. 'Complaints', 'Users'
 * @param {string} [datos.description]       - detalle legible de qué cambió
 */
async function registrarBitacora({ id_user, action, table_affected, description }) {
  try {
    await Bitacora.create({ id_user, action, table_affected, description });
  } catch (error) {
    console.error('⚠️ No se pudo registrar en la bitácora:', error.message);
  }
}

module.exports = { registrarBitacora };
