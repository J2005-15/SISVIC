const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medical_Records = sequelize.define('Medical_Records', {
  id_record: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_animal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Animal_Census',
      key: 'id_animal'
    }
  },
  id_vet_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id_user'
    }
  },
  id_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Medical_Day',
      key: 'id_day'
    }
  },
  consultation_reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  weight_kg: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  temperature: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  appointment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Medical_Records',
  timestamps: false
});

module.exports = Medical_Records;