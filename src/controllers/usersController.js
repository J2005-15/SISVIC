const { Op } = require('sequelize');
const { Users, Roles } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { registrarBitacora } = require('../utils/bitacora');
const { env } = require('../config/env');
const emailService = require('../services/emailService');

// Obtener usuarios — paginado y filtrable. Query params: page (def. 1),
// limit (def. 10), search (nombre completo o email, parcial case-insensitive),
// role (nombre exacto del rol, ej. 'administrador' — filtra sobre Roles.role_name).
const getUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const role   = (req.query.role   || '').trim();
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // El filtro por rol va en el where DEL include, no como clave de notación
    // de punto ('$Role.role_name$') en el where principal — esa sintaxis es
    // frágil junto a subQuery:false + distinct:true en findAndCountAll y
    // provocaba un 500. required:true fuerza INNER JOIN solo cuando se filtra;
    // sin filtro, sigue siendo LEFT JOIN para no excluir usuarios sin rol.
    const { count, rows } = await Users.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] }, // Excluir contraseña en la respuesta
      include: [{
        model: Roles,
        as: 'Role',
        attributes: ['id_role', 'role_name'],
        where: role ? { role_name: role } : undefined,
        required: !!role,
      }],
      order: [['full_name', 'ASC']],
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

// Obtener un usuario por ID
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: { exclude: ['password'] }, // Excluir contraseña en la respuesta
      include: [{
        model: Roles,
        as: 'Role',
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

    registrarBitacora({
      id_user: req.user.id,
      action: 'crear',
      table_affected: 'Users',
      description: `Creó al usuario "${full_name}" (${email}) con rol id_role=${id_role}`
    });

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

    const estadoAnterior = user.status;
    await user.update(updateData);

    // Excluir contraseña de la respuesta
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    registrarBitacora({
      id_user: req.user.id,
      action: estadoAnterior !== status ? 'cambio_estado' : 'actualizar',
      table_affected: 'Users',
      description: estadoAnterior !== status
        ? `Cambió el estado del usuario #${id} de "${estadoAnterior}" a "${status}"`
        : `Actualizó los datos del usuario #${id} (${user.email})`
    });

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
    const emailEliminado = user.email;
    await user.destroy();

    registrarBitacora({
      id_user: req.user.id,
      action: 'eliminar',
      table_affected: 'Users',
      description: `Eliminó al usuario #${id} (${emailEliminado})`
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Obtenido del token JWT 
    
    const user = await Users.findByPk(userId, {
      attributes: ['id_user', 'email', 'full_name'], // Traemos datos solicitados
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

// Actualizar perfil del usuario autenticado
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si envía un correo, verificar que no le pertenezca a otra persona
    if (email && email !== user.email) {
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
    }

    await user.update({ full_name, email });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: { id_user: user.id_user, full_name: user.full_name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/change-password — el usuario autenticado cambia su propia
// contraseña. Requiere conocer la contraseña actual (verificada con bcrypt).
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(current_password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'La contraseña actual no es correcta' });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    registrarBitacora({
      id_user: userId,
      action: 'actualizar',
      table_affected: 'Users',
      description: `El usuario #${userId} cambió su propia contraseña`
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/forgot-password — genera un token de un solo uso y envía
// el enlace de recuperación por correo (nodemailer vía emailService).
// La respuesta es siempre genérica, exista o no el email, para no permitir
// que alguien enumere cuentas registradas probando correos al azar.
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const mensajeGenerico = { message: 'Si el correo está registrado, se enviará un enlace de recuperación.' };

    const user = await Users.findOne({ where: { email, status: 'activo' } });
    if (!user) {
      return res.status(200).json(mensajeGenerico);
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.reset_token = token;
    await user.save();

    const dashboardUrl = env.DASHBOARD_URL || 'http://localhost:5173';
    const resetUrl = `${dashboardUrl}/reset-password?token=${token}`;
    await emailService.sendPasswordResetLink(email, resetUrl);

    res.status(200).json(mensajeGenerico);
  } catch (error) {
    next(error);
  }
};

// POST /api/users/reset-password — valida el token recibido por correo y
// guarda la nueva contraseña. El token es de un solo uso: se limpia tras usarlo.
const resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    const user = await Users.findOne({ where: { reset_token: token } });
    if (!user) {
      return res.status(400).json({ message: 'El enlace es inválido o ya fue utilizado.' });
    }

    user.password = await bcrypt.hash(new_password, 10);
    user.reset_token = null;
    await user.save();

    registrarBitacora({
      id_user: user.id_user,
      action: 'actualizar',
      table_affected: 'Users',
      description: `El usuario #${user.id_user} restableció su contraseña mediante el enlace de recuperación`
    });

    res.status(200).json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};