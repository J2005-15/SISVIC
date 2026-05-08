const { Staff_Volunteers } = require('../models');

// Obtener todo el personal y voluntarios
const getStaffVolunteers = async (req, res, next) => {
  try {
    const staff = await Staff_Volunteers.findAll({ order: [['last_name', 'ASC']] });
    res.json({ staff });
  } catch (error) {
    next(error);
  }
};

// Obtener un miembro por ID
const getStaffVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Staff_Volunteers.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }
    res.json({ staffVolunteer: member });
  } catch (error) {
    next(error);
  }
};

// Crear un miembro del staff
const createStaffVolunteer = async (req, res, next) => {
  try {
    const { first_name, last_name, dni_number, phone, staff_type } = req.body;
    const member = await Staff_Volunteers.create({ first_name, last_name, dni_number, phone, staff_type });
    res.status(201).json({ message: 'Miembro del staff creado exitosamente', staffVolunteer: member });
  } catch (error) {
    next(error);
  }
};

// Actualizar un miembro del staff
const updateStaffVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dni_number, phone, staff_type } = req.body;
    const member = await Staff_Volunteers.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }
    await member.update({ first_name, last_name, dni_number, phone, staff_type });
    res.json({ message: 'Miembro del staff actualizado exitosamente', staffVolunteer: member });
  } catch (error) {
    next(error);
  }
};

// Eliminar un miembro del staff
const deleteStaffVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Staff_Volunteers.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }
    await member.destroy();
    res.json({ message: 'Miembro del staff eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffVolunteers,
  getStaffVolunteer,
  createStaffVolunteer,
  updateStaffVolunteer,
  deleteStaffVolunteer
};