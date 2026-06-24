const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Adoption = sequelize.define('Adoption', {
  id_Adoption: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_pet: {
    type: DataTypes.INTEGER,
    allowNull: false // Clave foránea que asociaremos en tu index de modelos
  },
  visitor_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  visitor_email: { 
    type: DataTypes.STRING 
  },
  visitor_phone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  visitor_id_card: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: false
  },
  visitor_address: {
    type: DataTypes.TEXT
  },
  Adoption_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending' // pending, approved, rejected
  }
}, {
  tableName: 'Adoption',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Adoption;