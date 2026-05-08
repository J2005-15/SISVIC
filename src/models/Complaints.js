const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaints = sequelize.define('Complaints', {
  id_complaint: {
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
  id_sector: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Sectors',
      key: 'id_sector'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Urgente'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Recibida', 'En_Investigación', 'Resuelta', 'Desestimada'),
    allowNull: false
  }
}, {
  tableName: 'Complaints',
  timestamps: false
});

module.exports = Complaints;