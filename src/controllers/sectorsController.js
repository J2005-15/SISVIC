const { Sectors } = require('../models');

// Obtener todos los sectores
const getSectors = async (req, res, next) => {
  try {
    const sectors = await Sectors.findAll({
      order: [['community_name', 'ASC']]
    });
    res.json({ sectors });
  } catch (error) {
    next(error);
  }
};

// Obtener un sector por ID
const getSector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sector = await Sectors.findByPk(id);
    if (!sector) {
      return res.status(404).json({ message: 'Sector no encontrado' });
    }
    res.json({ sector });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo sector
const createSector = async (req, res, next) => {
  try {
    const { community_name, parish, municipality } = req.body;
    const sector = await Sectors.create({
      community_name,
      parish,
      municipality
    });
    res.status(201).json({
      message: 'Sector creado exitosamente',
      sector
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un sector
const updateSector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { community_name, parish, municipality } = req.body;
    const sector = await Sectors.findByPk(id);
    if (!sector) {
      return res.status(404).json({ message: 'Sector no encontrado' });
    }
    await sector.update({ community_name, parish, municipality });
    res.json({
      message: 'Sector actualizado exitosamente',
      sector
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un sector
const deleteSector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sector = await Sectors.findByPk(id);
    if (!sector) {
      return res.status(404).json({ message: 'Sector no encontrado' });
    }
    await sector.destroy();
    res.json({ message: 'Sector eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSectors,
  getSector,
  createSector,
  updateSector,
  deleteSector
};