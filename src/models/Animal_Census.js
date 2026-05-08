const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Animal_Census = sequelize.define('Animal_Census', {
  id_animal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  animal_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  species: {
    type: DataTypes.ENUM('Canino', 'Felino', 'Otro'),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('M', 'H'),
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  color: {
    type: DataTypes.ENUM('Negro', 'Blanco', 'Marron', 'Gris', 'Dorado', 'Manchado', 'Bicolor', 'Tricolor'),
    allowNull: true
  },
  approx_age: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  id_owner: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Owners',
      key: 'id_owner'
    }
  },
  id_sector: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Sectors',
      key: 'id_sector'
    }
  }
}, {
  tableName: 'Animal_Census',
  timestamps: false
});

module.exports = Animal_Census;