const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


pool.connect()
    .then(() => console.log( 'Conectado exitosamente a PostgreSQL (SISCVI)'))
    .catch((error) => console.error(' Error conectando a la base de datos:', error));

module.exports = pool;