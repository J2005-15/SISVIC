const { Roles } = require('../models');

// Obtener todos los roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await Roles.findAll({
      order: [['id_role', 'ASC']]
    });
    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

// Obtener un rol por ID
const getRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Roles.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json({ role });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getRole
};