const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stock_Movements = sequelize.define('Stock_Movements', {
  id_movement: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_supply: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Supply_Stock', key: 'id_supply' }
  },
  previous_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  new_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  adjustment_reason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: 'Ajuste manual'
  }
}, {
  tableName: 'Stock_Movements',
  timestamps: true,
  updatedAt: false   // solo necesitamos createdAt como marca temporal
});

module.exports = Stock_Movements;
