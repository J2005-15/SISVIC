const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Used_Supplies = sequelize.define('Used_Supplies', {
  id_usage: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_record: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Medical_Records',
      key: 'id_record'
    }
  },
  id_supply: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Supply_Stock',
      key: 'id_supply'
    }
  },
  used_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Used_Supplies',
  timestamps: false
});

module.exports = Used_Supplies;