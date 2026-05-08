const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sectors = sequelize.define('Sectors', {
  id_sector: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  community_name: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  parish: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  municipality: {
    type: DataTypes.STRING(50),
    defaultValue: 'Jáuregui'
  }
}, {
  tableName: 'Sectors',
  timestamps: false
});

module.exports = Sectors;