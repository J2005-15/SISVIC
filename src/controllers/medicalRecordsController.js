const { Medical_Records, Animal_Census, Users, Medical_Day } = require('../models');

// Obtener todos los registros médicos
const getMedicalRecords = async (req, res, next) => {
  try {
    const medicalRecords = await Medical_Records.findAll({
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Users, attributes: ['id_user', 'name'] },
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
        { model: Users, attributes: ['id_user', 'name'] },
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
const createMedicalRecord = async (req, res, next) => {
  try {
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

    const medicalRecord = await Medical_Records.create({
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

    res.status(201).json({ message: 'Registro médico creado exitosamente', medicalRecord });
  } catch (error) {
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
