const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff_Volunteers = sequelize.define('Staff_Volunteers', {
  id_staff: {
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
  staff_type: {
    type: DataTypes.ENUM('Rescates', 'Rehabilitación', 'Apoyo en Jornadas', 'Educación Comunitaria', 'Campañas de Incidencia', 'Capacitación'),
    allowNull: false
  },
  day_attendances: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  tableName: 'Staff_Volunteers',
  timestamps: false
});

module.exports = Staff_Volunteers;