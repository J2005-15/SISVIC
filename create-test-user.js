const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const Users = require('./src/models/Users');
const Roles = require('./src/models/Roles');

const rolasData = [
  { id_role: 1, role_name: 'admin' },
  { id_role: 2, role_name: 'veterinario' },
  { id_role: 3, role_name: 'operador' }
];

const usuariosTest = [
  { email: 'admin@siscvi.com', full_name: 'Administrador', id_role: 1, password: 'Sistema123' },
  { email: 'veterinario@siscvi.com', full_name: 'Dr. Pérez', id_role: 2, password: 'Sistema123' },
  { email: 'operador@siscvi.com', full_name: 'Carlos Ramírez', id_role: 3, password: 'Sistema123' }
];

async function createTestUsers() {
  try {
    console.log('🔄 Configurando roles y usuarios de prueba...\n');

    // Crear roles si no existen
    for (const rolData of rolasData) {
      const rolExistente = await Roles.findByPk(rolData.id_role);
      if (!rolExistente) {
        await Roles.create(rolData);
        console.log(`✅ Rol creado: ${rolData.role_name}`);
      } else {
        console.log(`⏭️  Rol ${rolData.role_name} ya existe`);
      }
    }

    console.log('');

    // Crear usuarios
    for (const usuarioData of usuariosTest) {
      const hashedPassword = await bcrypt.hash(usuarioData.password, 10);

      // Verificar si ya existe
      const existente = await Users.findOne({ where: { email: usuarioData.email } });

      if (existente) {
        console.log(`⏭️  ${usuarioData.email} ya existe, omitiendo...`);
        continue;
      }

      const user = await Users.create({
        email: usuarioData.email,
        password: hashedPassword,
        full_name: usuarioData.full_name,
        id_role: usuarioData.id_role,
        status: 'activo'
      });

      console.log(`✅ Usuario creado: ${user.email}`);
    }

    console.log('\n🎉 Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();
