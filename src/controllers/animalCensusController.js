const { Op } = require('sequelize');
const { Animal_Census, Owners, Sectors } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');

// Obtener censos de animales — paginado y filtrable desde el servidor.
// Query params: page (def. 1), limit (def. 10), search (nombre del animal
// o nombre del propietario, búsqueda parcial case-insensitive).
const getAnimalCensuses = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search  = (req.query.search  || '').trim();
    const species = (req.query.species || '').trim();
    const offset = (page - 1) * limit;

    // Ambos filtros son independientes y se combinan con AND: la categoría
    // (species) acota el universo, la búsqueda (search) filtra dentro de él.
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { animal_name: { [Op.iLike]: `%${search}%` } },
        { '$Owners.full_name$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (species) {
      whereClause.species = species;
    }

    const { count, rows } = await Animal_Census.findAndCountAll({
      where: whereClause,
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
      order: [['animal_name', 'ASC']],
      limit,
      offset,
      subQuery: false, // necesario: el where filtra sobre Owners (modelo incluido)
      distinct: true,  // evita que el join con Owners infle el conteo total
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
    const { animal_name, species, gender, breed, color, approx_age, census_date, symptoms, id_owner, id_sector } = req.body;

    const animalCensus = await Animal_Census.create({
      animal_name,
      species,
      gender,
      breed,
      color,
      approx_age,
      census_date,
      symptoms,
      id_owner,
      id_sector
    });
    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Animal_Census',
      description: `Registró en el censo al animal "${animal_name ?? 'sin nombre'}" (${species})`
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
    const { animal_name, species, gender, breed, color, approx_age, census_date, symptoms, id_owner, id_sector } = req.body;
    const animalCensus = await Animal_Census.findByPk(id);
    if (!animalCensus) {
      return res.status(404).json({ message: 'Censo de animal no encontrado' });
    }

    const datosActualizados = { animal_name, species, gender, breed, color, approx_age, census_date, symptoms, id_owner, id_sector };

    await animalCensus.update(datosActualizados);

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Animal_Census',
      description: `Actualizó el registro de censo #${id} (${animal_name ?? 'sin nombre'})`
    });

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
    const nombreEliminado = animalCensus.animal_name;
    await animalCensus.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Animal_Census',
      description: `Eliminó el registro de censo #${id} (${nombreEliminado ?? 'sin nombre'})`
    });

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