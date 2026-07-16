const { Op } = require('sequelize');
const { Pets } = require('../models');
const { registrarBitacora } = require('../utils/bitacora');
const { cacheInvalidar } = require('../utils/cache');

// Endpoint ADMINISTRATIVO (protegido) para el panel — independiente de
// GET /api/public/pets, que es consumido por el sitio público de adopciones
// y se deja intacto para no romper esa integración externa.
// Paginado y filtrable. Query params: page (def. 1), limit (def. 10),
// search (nombre del animal, parcial case-insensitive), status (ENUM exacto,
// ej. 'available' o 'adopted'), species (exacto, ej. 'Canino', 'Felino',
// 'Otro' — mismos valores que usa CensoAnimal.jsx).
const getPetsAdmin = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const species = (req.query.species || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      whereClause.status = status;
    }
    if (species) {
      whereClause.species = species;
    }

    const { count, rows } = await Pets.findAndCountAll({
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

// Crear una mascota — reemplaza al POST /api/pets crudo que vivía en app.js
// (multer.diskStorage local, sin auth). Ahora el archivo llega vía
// upload.single('foto') de utils/upload.js: multer ya lo subió a Cloudinary
// antes de que esta función se ejecute, y req.file.path es la URL segura
// (https://res.cloudinary.com/...) — nunca se construye una URL local.
const createPet = async (req, res, next) => {
  try {
    const { nombre, especie, raza, sexo, edad, color, energia, estado, historia } = req.body;
    const image_url = req.file ? req.file.path : null;

    const descripcion = `${historia} | Sexo: ${sexo} | Color: ${color} | Comportamiento: ${energia} | Estado: ${estado}`;

    const pet = await Pets.create({
      name: nombre,
      species: especie,
      breed: raza || null,
      age: edad,
      description: descripcion,
      image_url,
      status: 'available',
    });

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Pets',
      description: `Publicó en la cartelera al animal "${nombre}" (${especie})`
    });

    // Invalida el caché público para que la nueva mascota aparezca de inmediato
    cacheInvalidar('pets:disponibles', 'dashboard:stats');

    res.status(201).json({ message: 'Mascota publicada en cartelera', pet });
  } catch (error) {
    next(error);
  }
};

// Actualizar una mascota — usado por CarteleraAdopcion.jsx (modal Editar).
// La foto es opcional: si llega un archivo nuevo (vía upload.single('foto')),
// Cloudinary ya la subió y req.file.path trae la nueva URL segura; si no
// llega archivo, se conserva la foto que la mascota ya tenía.
const updatePet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, species, breed, age, description, status } = req.body;

    const pet = await Pets.findByPk(id);
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    const datosActualizados = { name, species, breed, age, description, status };
    if (req.file) {
      datosActualizados.image_url = req.file.path;
    }

    await pet.update(datosActualizados);

    registrarBitacora({
      id_user: req.user.id,
      action: 'actualizar',
      table_affected: 'Pets',
      description: `Actualizó los datos de la mascota #${id} (${pet.name})`
    });

    cacheInvalidar('pets:disponibles', 'dashboard:stats');

    res.json({ message: 'Mascota actualizada exitosamente', pet });
  } catch (error) {
    next(error);
  }
};

// Eliminar una mascota — usado por CarteleraAdopcion.jsx.
const deletePet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pet = await Pets.findByPk(id);
    if (!pet) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    const nombreEliminado = pet.name;
    await pet.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Pets',
      description: `Eliminó la mascota #${id} (${nombreEliminado}) de la cartelera`
    });

    cacheInvalidar('pets:disponibles', 'dashboard:stats');

    res.json({ message: 'Mascota eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPetsAdmin, createPet, updatePet, deletePet };
