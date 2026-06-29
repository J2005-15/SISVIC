const { Op } = require('sequelize');
const { Bitacora, Users } = require('../models');

// Obtener historial de auditoría — paginado y filtrable. Query params: page
// (def. 1), limit (def. 10), search (usuario que ejecutó la acción, módulo
// afectado o descripción, parcial case-insensitive), action (ENUM exacto:
// 'crear' | 'actualizar' | 'eliminar' | 'cambio_estado').
const getBitacora = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const action = (req.query.action || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { table_affected: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { '$Users.full_name$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (action) {
      whereClause.action = action;
    }

    const { count, rows } = await Bitacora.findAndCountAll({
      where: whereClause,
      include: [
        { model: Users, attributes: ['id_user', 'full_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      subQuery: false, // necesario: el where puede filtrar sobre Users (modelo incluido)
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

module.exports = { getBitacora };
