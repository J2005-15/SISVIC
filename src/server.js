const { validateEnv } = require('./config/env');
const { sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
const { scheduleInventoryAlert } = require('./services/scheduledTasks');
const app = require('./app');

// CORS se configura una sola vez, en app.js, antes de las rutas.
// (No declarar otro app.use(cors(...)) aquí — un segundo middleware CORS
// duplica la cabecera Access-Control-Allow-Origin y el navegador rechaza
// la respuesta como ERR_FAILED, sin importar si el origen era válido.)

// Validar variables de entorno
validateEnv();

// ==========================================
// RECONEXIÓN AUTOMÁTICA Y SILENCIOSA (resiliencia ante VPN/ECONNRESET)
// ==========================================
// Si Neon rechaza la conexión, no se apaga el proceso: se reintenta cada
// 5 segundos. La advertencia se imprime UNA sola vez (bandera alertaMostrada);
// los reintentos siguientes son silenciosos. Solo se vuelve a imprimir en
// consola cuando la conexión y el app.listen() se completan con éxito.
const RECONEXION_INTERVALO_MS = 5000;
let alertaMostrada = false;

async function iniciarServidor() {
  try {
    // Autenticación: si falla, salta directo al catch (sin loggear aquí)
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    alertaMostrada = false;

    // Sincronizar modelos con la base de datos (alter: true para no borrar data)
    await syncDatabase({ alter: true });
    console.log('¡Tablas de la web pública creadas y actualizadas en Neon perfectamente!');

    // Inicializar tareas programadas
    scheduleInventoryAlert();

    // ==========================================
    // PUERTO PARA LA NUBE (Render)
    // ==========================================
    const PORT = process.env.PORT || 3000;

    // app.listen() solo se ejecuta dentro de este try, tras conexión y sync exitosos
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
      console.log(`Base de datos: ${process.env.DB_ENV || 'Neon'}`);
    });
  } catch (error) {
    if (!alertaMostrada) {
      console.warn('⚠️ Base de datos inaccesible (VPN activa). Esperando conexión silenciosamente...');
      alertaMostrada = true;
    }
    setTimeout(iniciarServidor, RECONEXION_INTERVALO_MS);
  }
}

iniciarServidor();