const { Animal_Census, Owners, Sectors } = require('../models');

// Obtener todos los censos de animales
const getAnimalCensuses = async (req, res, next) => {
  try {
    const animalCensuses = await Animal_Census.findAll({
      include: [
        {
          model: Owners,
          attributes: ['id_owner', 'full_name']
        },
        {
          model: Sectors,
          attributes: ['id_sector', 'community_name']
        }
      ],
      order: [['animal_name', 'ASC']]
    });
    res.json({ animalCensuses });
  } catch (error) {
    next(error);
  }
};

// Obtener un censo de animal por ID
const getAnimalCensus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const animalCensus = await Animal_Census.findByPk(id, {
      include: [
        {
          model: Owners,
          attributes: ['id_owner', 'full_name']
        },
        {
          model: Sectors,
          attributes: ['id_sector', 'community_name']
        }
      ]
    });
    if (!animalCensus) {
      return res.status(404).json({ message: 'Censo de animal no encontrado' });
    }
    res.json({ animalCensus });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo censo de animal
const createAnimalCensus = async (req, res, next) => {
  try {
    const { animal_name, species, gender, breed, color, approx_age, id_owner, id_sector } = req.body;
    const animalCensus = await Animal_Census.create({
      animal_name,
      species,
      gender,
      breed,
      color,
      approx_age,
      id_owner,
      id_sector
    });
    res.status(201).json({
      message: 'Censo de animal creado exitosamente',
      animalCensus
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un censo de animal
const updateAnimalCensus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { animal_name, species, gender, breed, color, approx_age, id_owner, id_sector } = req.body;
    const animalCensus = await Animal_Census.findByPk(id);
    if (!animalCensus) {
      return res.status(404).json({ message: 'Censo de animal no encontrado' });
    }
    await animalCensus.update({ animal_name, species, gender, breed, color, approx_age, id_owner, id_sector });
    res.json({
      message: 'Censo de animal actualizado exitosamente',
      animalCensus
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un censo de animal
const deleteAnimalCensus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const animalCensus = await Animal_Census.findByPk(id);
    if (!animalCensus) {
      return res.status(404).json({ message: 'Censo de animal no encontrado' });
    }
    await animalCensus.destroy();
    res.json({ message: 'Censo de animal eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnimalCensuses,
  getAnimalCensus,
  createAnimalCensus,
  updateAnimalCensus,
  deleteAnimalCensus
};