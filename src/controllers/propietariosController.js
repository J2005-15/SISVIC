const { Owners, Sectors, Animal_Census } = require('../models');

// GET - Listar todos los propietarios
exports.getAll = async (req, res) => {
  try {
    const propietarios = await Owners.findAll({
      include: [
        {
          model: Sectors,
          attributes: ['id_sector', 'community_name']
        }
      ],
      attributes: ['id_owner', 'full_name', 'id_card', 'phone_number', 'address', 'id_sector']
    });

    res.status(200).json({
      success: true,
      message: 'Propietarios obtenidos correctamente',
      owners: propietarios
    });
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietarios',
      error: error.message
    });
  }
};

// GET - Obtener propietario por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const propietario = await Owners.findByPk(id, {
      include: [
        {
          model: Sectors,
          attributes: ['id_sector', 'community_name']
        }
      ]
    });

    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Propietario obtenido correctamente',
      owner: propietario
    });
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietario',
      error: error.message
    });
  }
};

// POST - Crear nuevo propietario
exports.create = async (req, res) => {
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

    // Crear propietario
    const nuevoProprietario = await Owners.create({
      full_name: full_name.trim(),
      id_card: id_card.trim(),
      phone_number: phone_number.trim(),
      address: address.trim(),
      id_sector
    });

    res.status(201).json({
      success: true,
      message: 'Propietario creado exitosamente',
      owner: nuevoProprietario
    });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear propietario',
      error: error.message
    });
  }
};

// PUT - Actualizar propietario
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, id_card, phone_number, address, id_sector } = req.body;

    // Verificar que el propietario existe
    const propietario = await Owners.findByPk(id);
    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

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

    // Verificar que la cédula no esté usada por otro propietario
    if (id_card !== propietario.id_card) {
      const cedulaDuplicada = await Owners.findOne({ where: { id_card } });
      if (cedulaDuplicada) {
        return res.status(400).json({
          success: false,
          message: 'La cédula de identidad ya está registrada por otro propietario'
        });
      }
    }

    // Actualizar propietario
    await propietario.update({
      full_name: full_name.trim(),
      id_card: id_card.trim(),
      phone_number: phone_number.trim(),
      address: address.trim(),
      id_sector
    });

    res.status(200).json({
      success: true,
      message: 'Propietario actualizado exitosamente',
      owner: propietario
    });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar propietario',
      error: error.message
    });
  }
};

// DELETE - Eliminar propietario
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el propietario existe
    const propietario = await Owners.findByPk(id);
    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    // Verificar si el propietario tiene animales asociados
    const animalesAsociados = await Animal_Census.count({ where: { id_owner: id } });
    if (animalesAsociados > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. El propietario tiene ${animalesAsociados} animal(es) asociado(s)`
      });
    }

    // Eliminar propietario
    await propietario.destroy();

    res.status(200).json({
      success: true,
      message: 'Propietario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar propietario',
      error: error.message
    });
  }
};
