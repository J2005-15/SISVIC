// ── SISTEMA DE CACHÉ CON REDIS ────────────────────────────────────────────────
// Patrón fail-open: si REDIS_URL no está definida o Redis no está disponible,
// las funciones ejecutan la consulta original sin caché — la aplicación nunca
// crashea por culpa de Redis.
//
// Configuración mínima en Render/Upstash:
//   Variable de entorno → REDIS_URL = rediss://default:TOKEN@HOST:PORT

let cliente = null;
let disponible = false;

if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    cliente = new Redis(process.env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    cliente.on('connect', () => {
      disponible = true;
      console.log('✅ Redis conectado');
    });
    cliente.on('error', () => {
      disponible = false;
    });

    cliente.connect().catch(() => {
      disponible = false;
    });
  } catch {
    console.warn('⚠️  Redis no pudo iniciarse — el sistema funciona sin caché');
  }
}

/**
 * Obtiene un valor del caché o ejecuta fn(), guarda el resultado y lo retorna.
 * @param {string} clave       - Clave Redis (ej. 'pets:disponibles')
 * @param {number} ttlSegundos - Tiempo de vida del caché en segundos
 * @param {Function} fn        - Función async que retorna los datos frescos
 */
async function cacheGet(clave, ttlSegundos, fn) {
  if (!disponible || !cliente) return fn();
  try {
    const guardado = await cliente.get(clave);
    if (guardado !== null) return JSON.parse(guardado);
    const resultado = await fn();
    await cliente.setex(clave, ttlSegundos, JSON.stringify(resultado));
    return resultado;
  } catch {
    // Si Redis falla en mitad de una operación, se cae a la consulta directa
    return fn();
  }
}

/**
 * Elimina una o más claves del caché (para invalidar tras mutaciones).
 * @param {...string} claves - Claves a eliminar
 */
async function cacheInvalidar(...claves) {
  if (!disponible || !cliente || claves.length === 0) return;
  try {
    await cliente.del(...claves);
  } catch { /* silencioso — no debe interrumpir la operación principal */ }
}

module.exports = { cacheGet, cacheInvalidar };
