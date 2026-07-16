const rateLimit = require('express-rate-limit');

// ── LIMITADORES DE TASA (Rate Limiting) ──────────────────────────────────────
// Todos usan almacenamiento en memoria (por defecto), suficiente para una
// instancia. Si se escala a múltiples instancias en el futuro, migrar el store
// a Redis usando rate-limit-redis.
//
// IMPORTANTE: app.set('trust proxy', 1) debe estar activo en app.js para que
// req.ip refleje la IP real del cliente y no la del proxy de Render.

/** Límite general — protección básica contra abuso masivo */
const limitadorGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.' }
});

/** Límite estricto para login — anti brute-force de contraseñas */
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Espera 15 minutos e intenta de nuevo.' }
});

/** Límite para envío de correos — evita spam de recuperación de contraseña */
const limitadorEmail = rateLimit({
  windowMs: 60 * 60 * 1000, // ventana de 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de solicitudes de correo alcanzado. Intenta nuevamente en 1 hora.' }
});

/** Límite para formularios públicos — adopciones y colaboraciones desde la web */
const limitadorPublico = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en 1 hora.' }
});

module.exports = { limitadorGeneral, limitadorLogin, limitadorEmail, limitadorPublico };
