const { validateEnv } = require('./config/env');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const app = require('./app');

// Validar variables de entorno
validateEnv();

// Probar conexión a la base de datos y sincronizar
(async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('No se pudo conectar a la base de datos. Saliendo...');
    process.exit(1);
  }

  // Sincronizar modelos con la base de datos
  await syncDatabase();

  // Puerto
  const PORT = process.env.PORT || 3000;

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV}`);
    console.log(`Base de datos: ${process.env.DB_ENV}`);
  });
})();