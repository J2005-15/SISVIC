const { Used_Supplies, Medical_Records, Supply_Stock } = require('../models');

// Obtener todos los consumos de suministros
const getUsedSupplies = async (req, res, next) => {
  try {
    const usedSupplies = await Used_Supplies.findAll({
      include: [
        { model: Medical_Records, attributes: ['id_record', 'diagnosis'] },
        { model: Supply_Stock, attributes: ['id_supply', 'material_name'] }
      ],
      order: [['id_usage', 'DESC']]
    });
    res.json({ usedSupplies });
  } catch (error) {
    next(error);
  }
};

// Obtener un consumo por ID
const getUsedSupply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usedSupply = await Used_Supplies.findByPk(id, {
      include: [
        { model: Medical_Records, attributes: ['id_record', 'diagnosis'] },
        { model: Supply_Stock, attributes: ['id_supply', 'material_name'] }
      ]
    });
    if (!usedSupply) {
      return res.status(404).json({ message: 'Uso de suministro no encontrado' });
    }
    res.json({ usedSupply });
  } catch (error) {
    next(error);
  }
};

// Crear consumo de suministro
const createUsedSupply = async (req, res, next) => {
  try {
    const { id_record, id_supply, used_quantity } = req.body;
    const usedSupply = await Used_Supplies.create({ id_record, id_supply, used_quantity });
    res.status(201).json({ message: 'Uso de suministro creado exitosamente', usedSupply });
  } catch (error) {
    next(error);
  }
};

// Actualizar consumo de suministro
const updateUsedSupply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_record, id_supply, used_quantity } = req.body;
    const usedSupply = await Used_Supplies.findByPk(id);
    if (!usedSupply) {
      return res.status(404).json({ message: 'Uso de suministro no encontrado' });
    }
    await usedSupply.update({ id_record, id_supply, used_quantity });
    res.json({ message: 'Uso de suministro actualizado exitosamente', usedSupply });
  } catch (error) {
    next(error);
  }
};

// Eliminar consumo de suministro
const deleteUsedSupply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usedSupply = await Used_Supplies.findByPk(id);
    if (!usedSupply) {
      return res.status(404).json({ message: 'Uso de suministro no encontrado' });
    }
    await usedSupply.destroy();
    res.json({ message: 'Uso de suministro eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsedSupplies,
  getUsedSupply,
  createUsedSupply,
  updateUsedSupply,
  deleteUsedSupply
};