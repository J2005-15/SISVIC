const { Day_Attendance, Medical_Day, Owners, Staff, Volunteers, Animal_Census } = require('../models');

const INCLUDES_ATTENDANCE = [
  { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] },
  { model: Owners, attributes: ['id_owner', 'full_name'] },
  { model: Staff, attributes: ['id_staff', 'first_name', 'last_name'] },
  { model: Volunteers, attributes: ['id_volunteer', 'first_name', 'last_name'] },
  { model: Animal_Census, attributes: ['id_animal', 'animal_name'] }
];

// Obtener todas las asistencias
const getDayAttendances = async (req, res, next) => {
  try {
    const attendances = await Day_Attendance.findAll({
      include: INCLUDES_ATTENDANCE,
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
      include: INCLUDES_ATTENDANCE
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
// Quien atendió debe ser exactamente uno: id_staff (personal) o id_volunteer
// (voluntario) — nunca ambos, nunca ninguno.
const createDayAttendance = async (req, res, next) => {
  try {
    const { id_day, id_owner, id_staff, id_volunteer, id_animal, arrival_time } = req.body;

    if (!!id_staff === !!id_volunteer) {
      return res.status(400).json({ message: 'Debe indicar exactamente uno: id_staff o id_volunteer, no ambos ni ninguno' });
    }

    const attendance = await Day_Attendance.create({
      id_day,
      id_owner,
      id_staff:     id_staff || null,
      id_volunteer: id_volunteer || null,
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
    const { id_day, id_owner, id_staff, id_volunteer, id_animal, arrival_time } = req.body;

    if (!!id_staff === !!id_volunteer) {
      return res.status(400).json({ message: 'Debe indicar exactamente uno: id_staff o id_volunteer, no ambos ni ninguno' });
    }

    const attendance = await Day_Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Asistencia no encontrada' });
    }
    await attendance.update({
      id_day,
      id_owner,
      id_staff:     id_staff || null,
      id_volunteer: id_volunteer || null,
      id_animal,
      arrival_time
    });
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