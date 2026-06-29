const { Op } = require('sequelize');
const { Staff } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// Obtener personal — paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (nombre, apellido o cédula, parcial case-insensitive),
// staff_type (categoría exacta del ENUM, ej. 'Veterinario').
const getStaff = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const staffType = (req.query.staff_type || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { dni_number: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (staffType) {
      whereClause.staff_type = staffType;
    }

    const { count, rows } = await Staff.findAndCountAll({
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

// Obtener un miembro del personal por ID
const getStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Staff.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro del personal no encontrado' });
    }
    res.json({ staff: member });
  } catch (error) {
    next(error);
  }
};

// Crear un miembro del personal
const createStaffMember = async (req, res, next) => {
  try {
    const { first_name, last_name, dni_number, phone, staff_type } = req.body;
    const member = await Staff.create({ first_name, last_name, dni_number, phone, staff_type });

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Staff',
      description: `Registró al personal "${first_name} ${last_name}" (${staff_type})`
    });

    res.status(201).json({ message: 'Personal registrado exitosamente', staff: member });
  } catch (error) {
    next(error);
  }
};

// Actualizar un miembro del personal
const updateStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dni_number, phone, staff_type } = req.body;
    const member = await Staff.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro del personal no encontrado' });
    }
    await member.update({ first_name, last_name, dni_number, phone, staff_type });

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Staff',
      description: `Actualizó los datos del personal #${id} (${first_name} ${last_name})`
    });

    res.json({ message: 'Personal actualizado exitosamente', staff: member });
  } catch (error) {
    next(error);
  }
};

// Eliminar un miembro del personal
const deleteStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Staff.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro del personal no encontrado' });
    }
    const nombreEliminado = `${member.first_name} ${member.last_name}`;
    await member.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Staff',
      description: `Eliminó al personal #${id} (${nombreEliminado})`
    });

    res.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
};
