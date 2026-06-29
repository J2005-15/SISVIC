const { Op } = require('sequelize');
const { Donations } = require('../models');

// Reemplaza el bloque crudo que vivía en app.js (GET /api/donations, SQL a
// mano sin paginar). Paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (nombre del colaborador, parcial case-insensitive),
// status (valor exacto: 'Por Verificar', 'verified', 'invalid').
// Nota: el modelo Donations no tiene un campo "tipo de colaboración" — no
// existe esa categoría en el esquema, así que el filtro práctico equivalente
// es el estado de verificación del aporte.
const getDonations = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.visitor_name = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Donations.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
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

// Estadísticas globales — totales reales de TODA la base de datos (no del
// array paginado que ve el cliente). 4 consultas independientes vía
// Promise.all: 1 suma (sum) + 3 conteos (count).
const getDonationStats = async (req, res, next) => {
  try {
    const [totalRecaudado, porVerificar, confirmadas, invalidas] = await Promise.all([
      Donations.sum('amount', { where: { status: 'verified' } }),
      Donations.count({ where: { status: 'Por Verificar' } }),
      Donations.count({ where: { status: 'verified' } }),
      Donations.count({ where: { status: 'invalid' } }),
    ]);

    res.json({
      totalRecaudado: totalRecaudado || 0,
      porVerificar,
      confirmadas,
      invalidas,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDonations, getDonationStats };
