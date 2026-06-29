const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Registro inmutable de auditoría: quién hizo qué, sobre qué módulo y cuándo.
// Solo createdAt (sin updatedAt) — una entrada de bitácora nunca se edita.
const Bitacora = sequelize.define('Bitacora', {
  id_log: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id_user'
    }
  },
  action: {
    type: DataTypes.ENUM('crear', 'actualizar', 'eliminar', 'cambio_estado'),
    allowNull: false
  },
  table_affected: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Bitacora',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Bitacora;
