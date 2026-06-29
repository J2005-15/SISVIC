const { Op } = require('sequelize');
const { Adoption, Pets } = require('../models');

// Reemplaza el bloque crudo que vivía en app.js (GET /api/adoption-requests,
// SQL a mano sin paginar). Paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (nombre del solicitante, parcial case-insensitive),
// status (Adoption_status exacto, ej. 'pending', 'Aprobada').
const getAdoptionRequests = async (req, res, next) => {
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
      whereClause.Adoption_status = status;
    }

    const { count, rows } = await Adoption.findAndCountAll({
      where: whereClause,
      include: [{ model: Pets, as: 'pet', attributes: ['id_pet', 'name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
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
// paginado que ve el cliente). Valores reales de Adoption_status: 'pending'
// (default), 'Aprobada', 'Rechazada' (ver app.js, endpoint de aprobación).
const getAdoptionStats = async (req, res, next) => {
  try {
    const [pendientes, aprobadas, rechazadas] = await Promise.all([
      Adoption.count({ where: { Adoption_status: 'pending' } }),
      Adoption.count({ where: { Adoption_status: 'Aprobada' } }),
      Adoption.count({ where: { Adoption_status: 'Rechazada' } }),
    ]);

    res.json({ pendientes, aprobadas, rechazadas });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdoptionRequests, getAdoptionStats };
