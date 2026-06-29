const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Voluntarios de la fundación. Entidad separada de Staff: sin id_user,
// con su propio catálogo de áreas de colaboración (volunteer_type) — el
// mismo conjunto de valores que ya existía en el ENUM de Staff_Volunteers.
const Volunteers = sequelize.define('Volunteers', {
  id_volunteer: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  dni_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  volunteer_type: {
    type: DataTypes.ENUM('Rescates', 'Rehabilitación', 'Apoyo en Jornadas', 'Educación Comunitaria', 'Campañas de Incidencia', 'Capacitación'),
    allowNull: false
  },
  day_attendances: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  tableName: 'Volunteers',
  timestamps: false
});

module.exports = Volunteers;
