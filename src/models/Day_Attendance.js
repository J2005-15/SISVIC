const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Day_Attendance = sequelize.define('Day_Attendance', {
  id_attendance: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Medical_Day',
      key: 'id_day'
    }
  },
  id_owner: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Owners',
      key: 'id_owner'
    }
  },
  id_staff: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Staff_Volunteers',
      key: 'id_staff'
    }
  },
  arrival_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_animal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Animal_Census',
      key: 'id_animal'
    }
  }
}, {
  tableName: 'Day_Attendance',
  timestamps: false
});

module.exports = Day_Attendance;