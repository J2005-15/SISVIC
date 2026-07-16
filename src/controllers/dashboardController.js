const { Op, col } = require('sequelize');
const { Users, Pets, Animal_Census, Donations, Medical_Records, Complaints, Supply_Stock, Owners, Adoption } = require('../models');
const { cacheGet } = require('../utils/cache');

// Estadísticas globales del panel principal — totales reales de Neon, no
// mock data. Una sola llamada (Promise.all) con un count()/findAll()
// independiente por modelo; ninguno depende del resultado de otro.
// Resultado cacheado 2 minutos en Redis para evitar 12 round-trips a Neon
// en cada apertura del panel. El TTL es lo suficientemente corto como para
// que el dashboard se sienta en tiempo real.
const getDashboardStats = async (req, res, next) => {
  try {
    const datos = await cacheGet('dashboard:stats', 120, async () => {
      const [
        totalUsuarios,
        usuariosActivos,
        totalMascotas,
        totalCensados,
        totalColaboraciones,
        totalConsultas,
        denunciasActivas,
        insumosAlerta,
        propietariosRegistrados,
        insumosCriticosRaw,
        solicitudesPendientes,
        mascotasRecientes,
      ] = await Promise.all([
        Users.count(),
        Users.count({ where: { status: 'activo' } }),
        Pets.count(),
        Animal_Census.count(),
        Donations.count(),
        Medical_Records.count(),
        Complaints.count({ where: { status: { [Op.in]: ['Recibida', 'En_Investigación'] } } }),
        Supply_Stock.count({ where: { current_quantity: { [Op.lte]: col('min_stock') } } }),
        Owners.count(),
        // Insumos críticos — los 4 suministros más urgentes (cantidad actual
        // <= mínimo), ordenados por los que están más cerca de agotarse.
        Supply_Stock.findAll({
          where: { current_quantity: { [Op.lte]: col('min_stock') } },
          attributes: ['material_name', 'current_quantity', 'min_stock'],
          order: [['current_quantity', 'ASC']],
          limit: 4,
        }),
        // Últimas solicitudes de adopción pendientes — si no hay ninguna,
        // se completa abajo con las últimas mascotas registradas en cartelera.
        Adoption.findAll({
          where: { Adoption_status: 'pending' },
          include: [{ model: Pets, as: 'pet', attributes: ['name'] }],
          order: [['created_at', 'DESC']],
          limit: 3,
        }),
        Pets.findAll({
          attributes: ['name', 'status'],
          order: [['created_at', 'DESC']],
          limit: 3,
        }),
      ]);

      const insumosCriticos = insumosCriticosRaw.map(insumo => ({
        nombre: insumo.material_name,
        cantidad: insumo.current_quantity,
        minimo: insumo.min_stock,
      }));

      // Si no hay solicitudes pendientes, se muestran las últimas mascotas
      // publicadas en la cartelera (mismo array, datos igualmente reales).
      const ultimasAdopciones = solicitudesPendientes.length > 0
        ? solicitudesPendientes.map(solicitud => ({
            nombre: solicitud.pet?.name ?? 'Mascota sin asignar',
            estado: 'Pendiente',
          }))
        : mascotasRecientes.map(mascota => ({
            nombre: mascota.name,
            estado: mascota.status === 'available' ? 'Disponible' : 'Adoptado',
          }));

      return {
        totalUsuarios,
        usuariosActivos,
        totalMascotas,
        totalCensados,
        totalColaboraciones,
        totalConsultas,
        denunciasActivas,
        insumosAlerta,
        propietariosRegistrados,
        insumosCriticos,
        ultimasAdopciones,
      };
    });

    res.json(datos);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
