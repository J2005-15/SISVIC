const cron = require('node-cron');
const { Supply_Stock } = require('../models');
const { sequelize } = require('../config/database');
const emailService = require('./emailService');
const { Users, Roles } = require('../models');

// Tarea que se ejecuta a las 7:00 AM cada día
const scheduleInventoryAlert = () => {
  cron.schedule('0 7 * * *', async () => {
    console.log('🔔 Ejecutando tarea de alertas de inventario...');

    try {
      // 1. Buscar productos con stock bajo (< 20)
      const lowStockProducts = await Supply_Stock.findAll({
        where: sequelize.where(
          sequelize.col('current_quantity'),
          sequelize.Op.lt,
          20
        )
      });

      // 2. Buscar productos próximos a vencer (< 30 días)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringProducts = await Supply_Stock.findAll({
        where: sequelize.where(
          sequelize.col('expiration_date'),
          sequelize.Op.lt,
          thirtyDaysFromNow
        )
      });

      // 3. Obtener todos los administradores
      const admins = await Users.findAll({
        include: [{
          model: Roles,
          where: { role_name: 'admin' },
          as: 'Role'
        }],
        attributes: ['id_user', 'email', 'full_name']
      });

      // 4. Si hay alertas y admins, enviar emails
      if ((lowStockProducts.length > 0 || expiringProducts.length > 0) && admins.length > 0) {
        for (const admin of admins) {
          await emailService.sendInventoryAlertEmail(
            admin.email,
            admin.full_name,
            lowStockProducts,
            expiringProducts
          );
        }
        console.log(`✅ Alertas enviadas a ${admins.length} administrador(es)`);
      } else {
        console.log('✅ Sin alertas de inventario');
      }
    } catch (error) {
      console.error('❌ Error en tarea de alertas:', error);
    }
  });

  console.log('⏰ Scheduler de inventario iniciado (7:00 AM diarios)');
};

module.exports = { scheduleInventoryAlert };
