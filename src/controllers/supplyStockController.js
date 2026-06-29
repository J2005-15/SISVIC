const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Supply_Stock, Stock_Movements } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// El "Estado del Stock" (Crítico/Alerta/Óptimo) no es una columna real en
// Supply_Stock — se deriva de current_quantity vs. min_stock, igual que
// calcularEstado() en LogisticaInventario.jsx. Esta expresión SQL replica
// esa misma regla para poder filtrar y contar en el servidor.
const CASE_ESTADO_STOCK = `
  CASE
    WHEN current_quantity = 0 THEN 'Crítico'
    WHEN min_stock > 0 AND current_quantity <= min_stock THEN 'Crítico'
    WHEN min_stock > 0 AND current_quantity <= min_stock * 1.5 THEN 'Alerta'
    ELSE 'Óptimo'
  END
`;

const ESTADOS_STOCK_VALIDOS = ['Crítico', 'Alerta', 'Óptimo'];

// Obtener stock de suministros — paginado y filtrable. Query params: page
// (def. 1), limit (def. 10), search (nombre del material, parcial
// case-insensitive), estado (Crítico/Alerta/Óptimo — ver CASE_ESTADO_STOCK).
const getSupplyStocks = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const estado = (req.query.estado || '').trim();
    const offset = (page - 1) * limit;

    const condiciones = [];
    if (search) {
      condiciones.push({ material_name: { [Op.iLike]: `%${search}%` } });
    }
    if (ESTADOS_STOCK_VALIDOS.includes(estado)) {
      condiciones.push(sequelize.where(sequelize.literal(CASE_ESTADO_STOCK), estado));
    }
    const whereClause = condiciones.length ? { [Op.and]: condiciones } : {};

    const { count, rows } = await Supply_Stock.findAndCountAll({
      where: whereClause,
      order: [['material_name', 'ASC']],
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

// Estadísticas globales — totales reales de TODA la tabla (no del array
// paginado que ve el cliente), usando la misma regla de CASE_ESTADO_STOCK.
const getSupplyStockStats = async (req, res, next) => {
  try {
    const [total, criticos, alertas] = await Promise.all([
      Supply_Stock.count(),
      Supply_Stock.count({ where: sequelize.where(sequelize.literal(CASE_ESTADO_STOCK), 'Crítico') }),
      Supply_Stock.count({ where: sequelize.where(sequelize.literal(CASE_ESTADO_STOCK), 'Alerta') }),
    ]);

    res.json({
      total,
      criticos,
      alertas,
      enAlerta: criticos + alertas,
    });
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
    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Supply_Stock',
      description: `Creó el suministro "${material_name}" (${category}, cantidad inicial: ${current_quantity})`
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

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Supply_Stock',
      description: `Actualizó los datos del suministro #${id} (${material_name})`
    });

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
    const nombreEliminado = supplyStock.material_name;
    await supplyStock.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Supply_Stock',
      description: `Eliminó el suministro #${id} (${nombreEliminado})`
    });

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

    registrarBitacora({
      id_user: req.user.id,
      action: 'cambio_estado',
      table_affected: 'Supply_Stock',
      description: `Ajustó el stock del suministro #${id} de ${previousQuantity} a ${current_quantity} (${adjustment_reason ?? 'sin motivo especificado'})`
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
  getSupplyStockStats,
  getSupplyStock,
  createSupplyStock,
  updateSupplyStock,
  deleteSupplyStock,
  patchSupplyStock,
  getSupplyHistory
};