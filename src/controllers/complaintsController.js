const { Complaints, Animal_Census, Sectors } = require('../models');

// Obtener todas las denuncias
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaints.findAll({
      include: [
        { model: Animal_Census, attributes: ['id_animal', 'animal_name'] },
        { model: Sectors, attributes: ['id_sector', 'community_name'] }
      ],
      order: [['priority', 'DESC']]
    });
    res.json({ complaints });
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
    await complaint.update({ id_animal, id_sector, description, priority, status });
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
    res.json({ message: 'Denuncia eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
};