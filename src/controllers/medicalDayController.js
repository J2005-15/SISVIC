const { Medical_Day, Sectors } = require('../models');

// Obtener todos los días médicos
const getMedicalDays = async (req, res, next) => {
  try {
    const days = await Medical_Day.findAll({
      include: [{ model: Sectors, attributes: ['id_sector', 'community_name'] }],
      order: [['date_event', 'DESC']]
    });
    res.json({ medicalDays: days });
  } catch (error) {
    next(error);
  }
};

// Obtener un día médico por ID
const getMedicalDay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const day = await Medical_Day.findByPk(id, {
      include: [{ model: Sectors, attributes: ['id_sector', 'community_name'] }]
    });
    if (!day) {
      return res.status(404).json({ message: 'Día médico no encontrado' });
    }
    res.json({ medicalDay: day });
  } catch (error) {
    next(error);
  }
};

// Crear un día médico
const createMedicalDay = async (req, res, next) => {
  try {
    const { day_name, id_sector, date_event, description } = req.body;
    const day = await Medical_Day.create({ day_name, id_sector, date_event, description });
    res.status(201).json({ message: 'Día médico creado exitosamente', medicalDay: day });
  } catch (error) {
    next(error);
  }
};

// Actualizar un día médico
const updateMedicalDay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day_name, id_sector, date_event, description } = req.body;
    const day = await Medical_Day.findByPk(id);
    if (!day) {
      return res.status(404).json({ message: 'Día médico no encontrado' });
    }
    await day.update({ day_name, id_sector, date_event, description });
    res.json({ message: 'Día médico actualizado exitosamente', medicalDay: day });
  } catch (error) {
    next(error);
  }
};

// Eliminar un día médico
const deleteMedicalDay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const day = await Medical_Day.findByPk(id);
    if (!day) {
      return res.status(404).json({ message: 'Día médico no encontrado' });
    }
    await day.destroy();
    res.json({ message: 'Día médico eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalDays,
  getMedicalDay,
  createMedicalDay,
  updateMedicalDay,
  deleteMedicalDay
};