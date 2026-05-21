const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Ajusta esta ruta si tu conexión está en otro lado

const Pets = sequelize.define('Pets', {
  id_pet: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  species: { 
    type: DataTypes.STRING, 
    allowNull: false // Ej: Dog, Cat
  },
  breed: { 
    type: DataTypes.STRING 
  },
  age: { 
    type: DataTypes.STRING 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available' // Permite filtrar en la web solo los 'available'
  },
  image_url: { 
    type: DataTypes.STRING // Para renderizar la foto en la página web
  }
}, {
  tableName: 'Pets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Pets;