const cors = require('cors'); // 1. Importamos cors aquí arriba
const { validateEnv } = require('./config/env');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const { scheduleInventoryAlert } = require('./services/scheduledTasks');
const app = require('./app');

// ==========================================
// 2. PERMISOS DE SEGURIDAD (CORS)
// ==========================================
// OJO: Si Netlify te da error de CORS, debes mover este bloque de código
// a tu archivo app.js, justo debajo de la línea "const app = express();"
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'sisvicmisionnevado.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Validar variables de entorno
validateEnv();

// Probar conexión a la base de datos y sincronizar
(async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('No se pudo conectar a la base de datos. Saliendo...');
    process.exit(1);
  }

  // Sincronizar modelos con la base de datos (alter: true para no borrar data)
  await syncDatabase({ alter: true });
  console.log('¡Tablas de la web pública creadas y actualizadas en Neon perfectamente!');

  // Inicializar tareas programadas
  scheduleInventoryAlert();

  // ==========================================
  // 3. PUERTO PARA LA NUBE (Render)
  // ==========================================
  const PORT = process.env.PORT || 3000;
  
  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
    console.log(`Base de datos: ${process.env.DB_ENV || 'Neon'}`);
  });
})();