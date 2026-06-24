const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supply_Stock = sequelize.define('Supply_Stock', {
  id_supply: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Vacuna', 'Antibiótico', 'Desparasitante', 'Material_Médico', 'Otro'),
    allowNull: false
  },
  current_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  measurement_unit: {
    type: DataTypes.ENUM('Unidad', 'ML', 'MG', 'Frasco', 'Caja'),
    allowNull: false
  },
  min_stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  batch_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  expiration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'Supply_Stock',
  timestamps: false
});

module.exports = Supply_Stock;