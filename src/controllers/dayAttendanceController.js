const { Day_Attendance, Medical_Day, Owners, Staff_Volunteers, Animal_Census } = require('../models');

// Obtener todas las asistencias
const getDayAttendances = async (req, res, next) => {
  try {
    const attendances = await Day_Attendance.findAll({
      include: [
        { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] },
        { model: Owners, attributes: ['id_owner', 'full_name'] },
        { model: Staff_Volunteers, attributes: ['id_staff', 'first_name', 'last_name'] },
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] }
      ],
      order: [['arrival_time', 'DESC']]
    });
    res.json({ attendances });
  } catch (error) {
    next(error);
  }
};

// Obtener una asistencia por ID
const getDayAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await Day_Attendance.findByPk(id, {
      include: [
        { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] },
        { model: Owners, attributes: ['id_owner', 'full_name'] },
        { model: Staff_Volunteers, attributes: ['id_staff', 'first_name', 'last_name'] },
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] }
      ]
    });
    if (!attendance) {
      return res.status(404).json({ message: 'Asistencia no encontrada' });
    }
    res.json({ attendance });
  } catch (error) {
    next(error);
  }
};

// Crear una asistencia
const createDayAttendance = async (req, res, next) => {
  try {
    const { id_day, id_owner, id_staff, id_animal, arrival_time } = req.body;
    const attendance = await Day_Attendance.create({
      id_day,
      id_owner,
      id_staff,
      id_animal,
      arrival_time
    });
    res.status(201).json({ message: 'Asistencia creada exitosamente', attendance });
  } catch (error) {
    next(error);
  }
};

// Actualizar una asistencia
const updateDayAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_day, id_owner, id_staff, id_animal, arrival_time } = req.body;
    const attendance = await Day_Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Asistencia no encontrada' });
    }
    await attendance.update({ id_day, id_owner, id_staff, id_animal, arrival_time });
    res.json({ message: 'Asistencia actualizada exitosamente', attendance });
  } catch (error) {
    next(error);
  }
};

// Eliminar una asistencia
const deleteDayAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await Day_Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Asistencia no encontrada' });
    }
    await attendance.destroy();
    res.json({ message: 'Asistencia eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDayAttendances,
  getDayAttendance,
  createDayAttendance,
  updateDayAttendance,
  deleteDayAttendance
};