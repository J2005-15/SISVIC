const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medical_Day = sequelize.define('Medical_Day', {
  id_day: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  day_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_sector: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sectors',
      key: 'id_sector'
    }
  },
  date_event: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Medical_Day',
  timestamps: false
});

module.exports = Medical_Day;