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
  visitor_phone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  amount: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  payment_reference: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true // Evita que registren el mismo número de transferencia dos veces
  },
  payment_date: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending_verification' // El administrador auditará y lo pasará a 'verified'
  }
}, {
  tableName: 'Donations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Donations;