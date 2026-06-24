const { sequelize } = require('../config/database');
const { Medical_Records, Animal_Census, Users, Medical_Day, Used_Supplies } = require('../models');

// Obtener todos los registros médicos
const getMedicalRecords = async (req, res, next) => {
  try {
    const medicalRecords = await Medical_Records.findAll({
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Users, attributes: ['id_user', 'full_name'] },
        { model: Medical_Day, attributes: ['id_day', 'day_name', 'date_event'] }
      ],
      order: [['id_record', 'DESC']]
    });
    res.json({ medicalRecords });
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
      id_vet_user,
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
      id_vet_user,
      id_day,
      consultation_reason,
      diagnosis,
      treatment,
      weight_kg,
      temperature,
      appointment_date
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
    res.json({ message: 'Registro médico eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};
