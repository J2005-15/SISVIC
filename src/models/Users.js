const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Users = sequelize.define('Users', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_role: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Roles',
      key: 'id_role'
    }
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
    allowNull: false
  },
  // Token temporal de un solo uso para el flujo "olvidé mi contraseña".
  // La columna ya existe en Neon (creada por una migración ad-hoc previa);
  // se declara aquí para poder usarla vía Sequelize ORM (user.reset_token = ...).
  reset_token: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Users',
  timestamps: false
});

module.exports = Users;