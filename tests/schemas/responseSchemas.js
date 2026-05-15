const Joi = require('joi');

// Esquema para endpoint /health
const healthSchema = Joi.object({
  status: Joi.string().valid('OK').required(),
  message: Joi.string().required()
}).unknown(true);

// Esquema para respuesta de login exitosa
const loginSuccessSchema = Joi.object({
  message: Joi.string().required(),
  token: Joi.string().required(),
  user: Joi.object({
    id: Joi.number().required(),
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().required()
  }).required()
}).unknown(true);

// Esquema para error genérico
const errorSchema = Joi.object({
  message: Joi.string().required()
}).unknown(true);

// Esquema para GET /users (lista de usuarios)
const usersListSchema = Joi.object({
  users: Joi.array().items(
    Joi.object({
      id_user: Joi.number().required(),
      full_name: Joi.string().required(),
      email: Joi.string().email().required(),
      status: Joi.string().required(),
      created_at: Joi.date().required(),
      updated_at: Joi.date().required()
    })
  ).required()
}).unknown(true);

// Esquema para GET /users/:id (un usuario)
const userDetailSchema = Joi.object({
  user: Joi.object({
    id_user: Joi.number().required(),
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    status: Joi.string().required(),
    created_at: Joi.date().required(),
    updated_at: Joi.date().required(),
    Role: Joi.object({
      id_role: Joi.number().required(),
      role_name: Joi.string().required()
    }).required()
  }).required()
}).unknown(true);

// Esquema para GET /roles (lista de roles)
const rolesListSchema = Joi.object({
  roles: Joi.array().items(
    Joi.object({
      id_role: Joi.number().required(),
      role_name: Joi.string().required()
    })
  ).required()
}).unknown(true);

// Esquema para respuesta de recuperar contraseña
const recoverPasswordSchema = Joi.object({
  message: Joi.string().required(),
  note: Joi.string().optional()
}).unknown(true);

module.exports = {
  healthSchema,
  loginSuccessSchema,
  errorSchema,
  usersListSchema,
  userDetailSchema,
  rolesListSchema,
  recoverPasswordSchema
};