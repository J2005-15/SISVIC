const { Sequelize } = require('sequelize');
const { env } = require('./env');

let sequelize;

if (env.DB_ENV === 'local') {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: env.DB_HOST_LOCAL,
    port: env.DB_PORT_LOCAL,
    database: env.DB_NAME_LOCAL,
    username: env.DB_USER_LOCAL,
    password: env.DB_PASS_LOCAL,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: env.NODE_ENV === 'development' ? console.log : false
  });
} else if (env.DB_ENV === 'remote') {
  sequelize = new Sequelize(env.DB_URI_REMOTE, {
    dialect: 'postgres',
    pool: {
      max: 3,
      min: 0,
      acquire: 60000,
      idle: 30000
    },
    logging: env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: true,
      statement_timeout: 60000
    },
    connectTimeoutMs: 60000
  });
} else {
  throw new Error('Configuración de base de datos inválida. DB_ENV debe ser "local" o "remote".');
}

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    return false;
  }
}

async function syncDatabase() {
  try {
    // { force: true } borraría todo, así que usamos { alter: true }
    // esto actualiza las tablas existentes sin borrar tus datos.
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase 
};