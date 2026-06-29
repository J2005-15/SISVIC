const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Personal pagado/contratado de la fundación. Entidad separada de Volunteers:
// no inicia sesión en el sistema (sin id_user), es un registro operativo
// para asistencia a jornadas, igual que Volunteers, pero con su propio
// catálogo de roles internos (staff_type).
const Staff = sequelize.define('Staff', {
  id_staff: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  dni_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  staff_type: {
    type: DataTypes.ENUM('Veterinario', 'Asistente', 'Logística', 'Captador', 'Otro'),
    allowNull: false
  },
  day_attendances: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  tableName: 'Staff',
  timestamps: false
});

module.exports = Staff;
