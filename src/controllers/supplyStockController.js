const { Supply_Stock, Stock_Movements } = require('../models');

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
    const { material_name, category, current_quantity, measurement_unit, min_stock, batch_number, expiration_date } = req.body;
    const supplyStock = await Supply_Stock.create({
      material_name,
      category,
      current_quantity,
      measurement_unit,
      min_stock,
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
    const { material_name, category, current_quantity, measurement_unit, min_stock, batch_number, expiration_date } = req.body;
    const supplyStock = await Supply_Stock.findByPk(id);
    if (!supplyStock) {
      return res.status(404).json({ message: 'Suministro no encontrado' });
    }
    await supplyStock.update({ material_name, category, current_quantity, measurement_unit, min_stock, batch_number, expiration_date });
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

// Ajuste parcial de stock (PATCH) — solo actualiza current_quantity y registra el movimiento
const patchSupplyStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { current_quantity, adjustment_reason } = req.body;

    if (typeof current_quantity !== 'number' || !Number.isInteger(current_quantity) || current_quantity < 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número entero mayor o igual a 0' });
    }

    const supplyStock = await Supply_Stock.findByPk(id);
    if (!supplyStock) {
      return res.status(404).json({ message: 'Suministro no encontrado' });
    }

    const previousQuantity = supplyStock.current_quantity;
    await supplyStock.update({ current_quantity });

    await Stock_Movements.create({
      id_supply:          id,
      previous_quantity:  previousQuantity,
      new_quantity:       current_quantity,
      adjustment_reason:  adjustment_reason ?? 'Ajuste manual desde panel'
    });

    res.json({ message: 'Stock ajustado exitosamente', supplyStock });
  } catch (error) {
    next(error);
  }
};

// Historial de movimientos de stock para un suministro
const getSupplyHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movements = await Stock_Movements.findAll({
      where: { id_supply: id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    res.json({ movements });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplyStocks,
  getSupplyStock,
  createSupplyStock,
  updateSupplyStock,
  deleteSupplyStock,
  patchSupplyStock,
  getSupplyHistory
};