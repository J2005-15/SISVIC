const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Owners = sequelize.define('Owners', {
  id_owner: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_card: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  id_sector: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sectors',
      key: 'id_sector'
    }
  }
}, {
  tableName: 'Owners',
  timestamps: false
});

module.exports = Owners;