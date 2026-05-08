const { Owners, Sectors } = require('../models');

// Obtener todos los propietarios
const getOwners = async (req, res, next) => {
  try {
    const owners = await Owners.findAll({
      include: [{
        model: Sectors,
        attributes: ['id_sector', 'community_name']
      }],
      order: [['full_name', 'ASC']]
    });
    res.json({ owners });
  } catch (error) {
    next(error);
  }
};

// Obtener un propietario por ID
const getOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await Owners.findByPk(id, {
      include: [{
        model: Sectors,
        attributes: ['id_sector', 'community_name']
      }]
    });
    if (!owner) {
      return res.status(404).json({ message: 'Propietario no encontrado' });
    }
    res.json({ owner });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo propietario
const createOwner = async (req, res, next) => {
  try {
    const { full_name, id_card, phone_number, address, id_sector } = req.body;
    const owner = await Owners.create({
      full_name,
      id_card,
      phone_number,
      address,
      id_sector
    });
    res.status(201).json({
      message: 'Propietario creado exitosamente',
      owner
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un propietario
const updateOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, id_card, phone_number, address, id_sector } = req.body;
    const owner = await Owners.findByPk(id);
    if (!owner) {
      return res.status(404).json({ message: 'Propietario no encontrado' });
    }
    await owner.update({ full_name, id_card, phone_number, address, id_sector });
    res.json({
      message: 'Propietario actualizado exitosamente',
      owner
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un propietario
const deleteOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await Owners.findByPk(id);
    if (!owner) {
      return res.status(404).json({ message: 'Propietario no encontrado' });
    }
    await owner.destroy();
    res.json({ message: 'Propietario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner
};