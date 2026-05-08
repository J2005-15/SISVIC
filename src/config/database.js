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
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Para Neon, puede ser necesario
      }
    }
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

module.exports = {
  sequelize,
  testConnection
};