const { Op } = require('sequelize');
const { Volunteers } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// Obtener voluntarios — paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (nombre, apellido o cédula, parcial case-insensitive),
// volunteer_type (área de apoyo exacta del ENUM, ej. 'Rescates').
const getVolunteers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const volunteerType = (req.query.volunteer_type || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { dni_number: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (volunteerType) {
      whereClause.volunteer_type = volunteerType;
    }

    const { count, rows } = await Volunteers.findAndCountAll({
      where: whereClause,
      order: [['last_name', 'ASC']],
      limit,
      offset,
    });

    res.json({
      data: rows,
      metadata: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un voluntario por ID
const getVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteers.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Voluntario no encontrado' });
    }
    res.json({ volunteer });
  } catch (error) {
    next(error);
  }
};

// Crear un voluntario
const createVolunteer = async (req, res, next) => {
  try {
    const { first_name, last_name, dni_number, phone, volunteer_type } = req.body;
    const volunteer = await Volunteers.create({ first_name, last_name, dni_number, phone, volunteer_type });

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Volunteers',
      description: `Registró al voluntario "${first_name} ${last_name}" (${volunteer_type})`
    });

    res.status(201).json({ message: 'Voluntario registrado exitosamente', volunteer });
  } catch (error) {
    next(error);
  }
};

// Actualizar un voluntario
const updateVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dni_number, phone, volunteer_type } = req.body;
    const volunteer = await Volunteers.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Voluntario no encontrado' });
    }
    await volunteer.update({ first_name, last_name, dni_number, phone, volunteer_type });

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Volunteers',
      description: `Actualizó los datos del voluntario #${id} (${first_name} ${last_name})`
    });

    res.json({ message: 'Voluntario actualizado exitosamente', volunteer });
  } catch (error) {
    next(error);
  }
};

// Eliminar un voluntario
const deleteVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteers.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Voluntario no encontrado' });
    }
    const nombreEliminado = `${volunteer.first_name} ${volunteer.last_name}`;
    await volunteer.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Volunteers',
      description: `Eliminó al voluntario #${id} (${nombreEliminado})`
    });

    res.json({ message: 'Voluntario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
};
