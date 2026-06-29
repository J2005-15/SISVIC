const { Op } = require('sequelize');
const { Owners, Sectors } = require('../models');

// GET - Obtener propietarios — paginado y filtrable desde el servidor, igual
// que Users y Animal_Census. Query params: page (def. 1), limit (def. 10),
// search (nombre completo o cédula, parcial case-insensitive).
const getOwners = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { id_card: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Owners.findAndCountAll({
      where: whereClause,
      include: [{
        model: Sectors,
        attributes: ['id_sector', 'community_name']
      }],
      order: [['full_name', 'ASC']],
      limit,
      offset,
    });

    res.status(200).json({
      data: rows,
      metadata: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error en getOwners:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietarios',
      error: error.message
    });
  }
};

// GET - Obtener un propietario por ID
const getOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await Owners.findByPk(id, {
      include: [{
        model: Sectors,
        attributes: ['id_sector', 'community_name']
      }]
    });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Propietario obtenido correctamente',
      owner
    });
  } catch (error) {
    console.error('Error en getOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietario',
      error: error.message
    });
  }
};

// POST - Crear un nuevo propietario
const createOwner = async (req, res, next) => {
  try {
    const { full_name, id_card, phone_number, address, id_sector } = req.body;

    // Validar campos requeridos
    if (!full_name || !id_card || !phone_number || !address || !id_sector) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos (nombre, cédula, teléfono, dirección, sector) son requeridos'
      });
    }

    // Verificar que el sector existe
    const sectorExistente = await Sectors.findByPk(id_sector);
    if (!sectorExistente) {
      return res.status(400).json({
        success: false,
        message: 'El sector especificado no existe'
      });
    }

    // Verificar que la cédula no exista ya
    const cedulaExistente = await Owners.findOne({ where: { id_card } });
    if (cedulaExistente) {
      return res.status(400).json({
        success: false,
        message: 'La cédula de identidad ya está registrada'
      });
    }

    const owner = await Owners.create({
      full_name: full_name.trim(),
      id_card: id_card.trim(),
      phone_number: phone_number.trim(),
      address: address.trim(),
      id_sector
    });

    res.status(201).json({
      success: true,
      message: 'Propietario creado exitosamente',
      owner
    });
  } catch (error) {
    console.error('Error en createOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear propietario',
      error: error.message
    });
  }
};

// PUT - Actualizar un propietario
const updateOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, id_card, phone_number, address, id_sector } = req.body;

    // Validar campos requeridos
    if (!full_name || !id_card || !phone_number || !address || !id_sector) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos (nombre, cédula, teléfono, dirección, sector) son requeridos'
      });
    }

    const owner = await Owners.findByPk(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    // Verificar que el sector existe
    const sectorExistente = await Sectors.findByPk(id_sector);
    if (!sectorExistente) {
      return res.status(400).json({
        success: false,
        message: 'El sector especificado no existe'
      });
    }

    // Verificar que la cédula no esté usada por otro propietario
    if (id_card !== owner.id_card) {
      const cedulaDuplicada = await Owners.findOne({ where: { id_card } });
      if (cedulaDuplicada) {
        return res.status(400).json({
          success: false,
          message: 'La cédula de identidad ya está registrada por otro propietario'
        });
      }
    }

    await owner.update({
      full_name: full_name.trim(),
      id_card: id_card.trim(),
      phone_number: phone_number.trim(),
      address: address.trim(),
      id_sector
    });

    res.status(200).json({
      success: true,
      message: 'Propietario actualizado exitosamente',
      owner
    });
  } catch (error) {
    console.error('Error en updateOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar propietario',
      error: error.message
    });
  }
};

// DELETE - Eliminar un propietario
const deleteOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await Owners.findByPk(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    await owner.destroy();
    res.status(200).json({
      success: true,
      message: 'Propietario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar propietario',
      error: error.message
    });
  }
};

module.exports = {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner
};