const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donations = sequelize.define('Donations', {
  id_donation: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  visitor_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  visitor_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visitor_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destination_bank: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Por Verificar'
  }
}, {
  tableName: 'Donations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Donations;