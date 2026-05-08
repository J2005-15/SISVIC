const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Roles = sequelize.define('Roles', {
  id_role: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'Roles',
  timestamps: false
});

module.exports = Roles;