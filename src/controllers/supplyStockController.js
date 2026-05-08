const { Supply_Stock } = require('../models');

// Obtener todo el stock de suministros
const getSupplyStocks = async (req, res, next) => {
  try {
    const supplyStocks = await Supply_Stock.findAll({
      order: [['material_name', 'ASC']]
    });
    res.json({ supplyStocks });
  } catch (error) {
    next(error);
  }
};

// Obtener un suministro por ID
const getSupplyStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplyStock = await Supply_Stock.findByPk(id);
    if (!supplyStock) {
      return res.status(404).json({ message: 'Suministro no encontrado' });
    }
    res.json({ supplyStock });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo suministro
const createSupplyStock = async (req, res, next) => {
  try {
    const { material_name, category, current_quantity, measurement_unit, batch_number, expiration_date } = req.body;
    const supplyStock = await Supply_Stock.create({
      material_name,
      category,
      current_quantity,
      measurement_unit,
      batch_number,
      expiration_date
    });
    res.status(201).json({
      message: 'Suministro creado exitosamente',
      supplyStock
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un suministro
const updateSupplyStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { material_name, category, current_quantity, measurement_unit, batch_number, expiration_date } = req.body;
    const supplyStock = await Supply_Stock.findByPk(id);
    if (!supplyStock) {
      return res.status(404).json({ message: 'Suministro no encontrado' });
    }
    await supplyStock.update({ material_name, category, current_quantity, measurement_unit, batch_number, expiration_date });
    res.json({
      message: 'Suministro actualizado exitosamente',
      supplyStock
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un suministro
const deleteSupplyStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplyStock = await Supply_Stock.findByPk(id);
    if (!supplyStock) {
      return res.status(404).json({ message: 'Suministro no encontrado' });
    }
    await supplyStock.destroy();
    res.json({ message: 'Suministro eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplyStocks,
  getSupplyStock,
  createSupplyStock,
  updateSupplyStock,
  deleteSupplyStock
};