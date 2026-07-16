const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Medical_Records, Animal_Census, Users, Medical_Day, Used_Supplies } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// Obtener registros médicos — paginado y filtrable. Query params: page
// (def. 1), limit (def. 10), search (motivo de consulta o diagnóstico,
// parcial case-insensitive), motivo (consultation_reason exacto, ej.
// 'Vacunación', 'Enfermedad', 'Control', 'Emergencia' — valores fijos del
// dropdown de FormularioConsultaMedica.jsx).
const getMedicalRecords = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const motivo = (req.query.motivo || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { consultation_reason: { [Op.iLike]: `%${search}%` } },
        { diagnosis: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (motivo) {
      whereClause.consultation_reason = motivo;
    }

    const { count, rows } = await Medical_Records.findAndCountAll({
      where: whereClause,
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Users, attributes: ['id_user', 'full_name'] },
        { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] }
      ],
      order: [['id_record', 'DESC']],
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
// paginado que ve el cliente). "Pendiente" replica exactamente la regla de
// derivarEstado() en el frontend: sin fecha de cita o fecha futura cuenta
// como pendiente; fecha de hoy o pasada cuenta como atendido.
const getMedicalRecordsStats = async (req, res, next) => {
  try {
    const [pendientes, atendidos, emergencias] = await Promise.all([
      Medical_Records.count({
        where: {
          [Op.or]: [
            { appointment_date: null },
            { appointment_date: { [Op.gt]: sequelize.literal('CURRENT_DATE') } }
          ]
        }
      }),
      Medical_Records.count({
        where: { appointment_date: { [Op.lte]: sequelize.literal('CURRENT_DATE') } }
      }),
      Medical_Records.count({ where: { consultation_reason: 'Emergencia' } }),
    ]);

    res.json({ pendientes, atendidos, emergencias });
  } catch (error) {
    next(error);
  }
};

// Obtener un registro médico por ID
const getMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicalRecord = await Medical_Records.findByPk(id, {
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Users, attributes: ['id_user', 'full_name'] },
        { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] }
      ]
    });
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }
    res.json({ medicalRecord });
  } catch (error) {
    next(error);
  }
};

// Crear un registro médico
// El veterinario (id_vet_user) se toma del token autenticado, nunca del body,
// para que un usuario no pueda atribuir la consulta a otro veterinario.
// Los insumos utilizados (used_supplies) llegan en el mismo payload y se
// insertan en Used_Supplies dentro de la misma transacción: si alguno falla,
// no queda una consulta creada sin sus insumos.
const createMedicalRecord = async (req, res, next) => {
  const transaccion = await sequelize.transaction();
  try {
    const {
      id_animal,
      id_day,
      consultation_reason,
      diagnosis,
      treatment,
      weight_kg,
      temperature,
      appointment_date,
      used_supplies
    } = req.body;

    const medicalRecord = await Medical_Records.create({
      id_animal,
      id_vet_user: req.user.id,
      id_day,
      consultation_reason,
      diagnosis,
      treatment,
      weight_kg,
      temperature,
      appointment_date
    }, { transaction: transaccion });

    if (Array.isArray(used_supplies) && used_supplies.length > 0) {
      const filasInsumos = used_supplies
        .filter(s => s.id_supply)
        .map(s => ({
          id_record:     medicalRecord.id_record,
          id_supply:     s.id_supply,
          used_quantity: s.used_quantity || 1
        }));

      if (filasInsumos.length > 0) {
        await Used_Supplies.bulkCreate(filasInsumos, { transaction: transaccion });
      }
    }

    await transaccion.commit();

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Medical_Records',
      description: `Registró la consulta #${medicalRecord.id_record} (${consultation_reason}) para el animal id_animal=${id_animal}`
    });

    res.status(201).json({ message: 'Registro médico creado exitosamente', medicalRecord });
  } catch (error) {
    await transaccion.rollback();
    next(error);
  }
};

// Actualizar un registro médico
const updateMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      id_animal,
      id_day,
      consultation_reason,
      diagnosis,
      treatment,
      weight_kg,
      temperature,
      appointment_date
    } = req.body;

    const medicalRecord = await Medical_Records.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    await medicalRecord.update({
      id_animal,
      id_day,
      consultation_reason,
      diagnosis,
      treatment,
      weight_kg,
      temperature,
      appointment_date
    });

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Medical_Records',
      description: `Actualizó la consulta #${id} (${consultation_reason ?? 'sin motivo'})`
    });

    res.json({ message: 'Registro médico actualizado exitosamente', medicalRecord });
  } catch (error) {
    next(error);
  }
};

// Eliminar un registro médico
const deleteMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicalRecord = await Medical_Records.findByPk(id);
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    await medicalRecord.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Medical_Records',
      description: `Eliminó la consulta #${id} (${medicalRecord.consultation_reason ?? 'sin motivo'})`
    });

    res.json({ message: 'Registro médico eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordsStats,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};
