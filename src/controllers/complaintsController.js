const { Op } = require('sequelize');
const { Complaints, Animal_Census, Sectors } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// Obtener denuncias — paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (descripción del hecho, parcial case-insensitive),
// status (estado exacto del ENUM, ej. 'En_Investigación').
const getComplaints = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.description = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Complaints.findAndCountAll({
      where: whereClause,
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Sectors, attributes: ['id_sector', 'community_name'] }
      ],
      order: [['priority', 'DESC']],
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

// Obtener estadísticas globales de denuncias — totales reales de TODA la
// base de datos (no del array paginado que ve el cliente). 4 conteos
// independientes vía Complaints.count con su propio where cada uno.
// Nota: el ENUM real de priority es ('Baja','Media','Alta','Urgente') —
// no existe 'Crítica' en el modelo, así que el filtro de urgencia usa
// 'Alta' y 'Urgente'.
const getComplaintStats = async (req, res, next) => {
  try {
    const [recibidas, enInvestigacion, resueltas, urgentesSinResolver] = await Promise.all([
      Complaints.count({ where: { status: 'Recibida' } }),
      Complaints.count({ where: { status: 'En_Investigación' } }),
      Complaints.count({ where: { status: 'Resuelta' } }),
      Complaints.count({
        where: {
          priority: { [Op.in]: ['Alta', 'Urgente'] },
          status: { [Op.notIn]: ['Resuelta', 'Desestimada'] }
        }
      }),
    ]);

    res.json({
      recibidas,
      enInvestigacion,
      resueltas,
      urgentesSinResolver,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una denuncia por ID
const getComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaints.findByPk(id, {
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Sectors, attributes: ['id_sector', 'community_name'] }
      ]
    });
    if (!complaint) {
      return res.status(404).json({ message: 'Denuncia no encontrada' });
    }
    res.json({ complaint });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva denuncia
const createComplaint = async (req, res, next) => {
  try {
    const { id_animal, id_sector, description, priority, status } = req.body;
    const complaint = await Complaints.create({
      id_animal,
      id_sector,
      description,
      priority,
      status
    });

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Complaints',
      description: `Creó la denuncia #${complaint.id_complaint} (prioridad: ${priority})`
    });

    res.status(201).json({ message: 'Denuncia creada exitosamente', complaint });
  } catch (error) {
    next(error);
  }
};

// Actualizar una denuncia
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_animal, id_sector, description, priority, status } = req.body;
    const complaint = await Complaints.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Denuncia no encontrada' });
    }

    const estadoAnterior = complaint.status;
    await complaint.update({ id_animal, id_sector, description, priority, status });

    registrarBitacora({
      id_user: req.user.id,
      action: estadoAnterior !== status ? 'cambio_estado' : 'actualizar',
      table_affected: 'Complaints',
      description: estadoAnterior !== status
        ? `Cambió el estado de la denuncia #${id} de "${estadoAnterior}" a "${status}"`
        : `Actualizó los datos de la denuncia #${id}`
    });

    res.json({ message: 'Denuncia actualizada exitosamente', complaint });
  } catch (error) {
    next(error);
  }
};

// Eliminar una denuncia
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaints.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Denuncia no encontrada' });
    }
    await complaint.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Complaints',
      description: `Eliminó la denuncia #${id}`
    });

    res.json({ message: 'Denuncia eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintStats,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
};