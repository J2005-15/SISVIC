const { Users, Roles } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const getUsers = async (req, res, next) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ['password'] }, // Excluir contraseña en la respuesta
      include: [{
        model: Roles,
        attributes: ['id_role', 'role_name']
      }],
      order: [['full_name', 'ASC']]
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: { exclude: ['password'] }, // Excluir contraseña en la respuesta
      include: [{
        model: Roles,
        attributes: ['id_role', 'role_name']
      }]
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo usuario
const createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, id_role, status } = req.body;

    // Verificar si el email ya existe
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      full_name,
      email,
      password: hashedPassword,
      id_role,
      status
    });

    // Excluir contraseña de la respuesta
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, id_role, status } = req.body;

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== user.email) {
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
    }

    const updateData = { full_name, email, id_role, status };

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Excluir contraseña de la respuesta
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};