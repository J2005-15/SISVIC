const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { sequelize } = require('./config/database');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');

// Crear instancia de Express
const app = express();

// Middlewares de seguridad y logging
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
  credentials: true
}));
app.use(morgan('combined'));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', require('./routes/index'));

// Ruta de salud
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'Servidor y base de datos funcionando' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error en la base de datos' });
  }
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

module.exports = app;