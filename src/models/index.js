const { sequelize } = require('../config/database');
const Sectors = require('./Sectors');
const Owners = require('./Owners');
const Roles = require('./Roles');
const Users = require('./Users');
const Staff_Volunteers = require('./Staff_Volunteers');
const Medical_Day = require('./Medical_Day');
const Animal_Census = require('./Animal_Census');
const Complaints = require('./Complaints');
const Day_Attendance = require('./Day_Attendance');
const Medical_Records = require('./Medical_Records');
const Supply_Stock = require('./Supply_Stock');
const Used_Supplies = require('./Used_Supplies');
const Pets = require('./Pets');
const Adoption = require('./Adoption');
const Donations = require('./Donations');


// Objeto para almacenar todos los modelos
const models = {
  Sectors,
  Owners,
  Roles,
  Users,
  Staff_Volunteers,
  Medical_Day,
  Animal_Census,
  Complaints,
  Day_Attendance,
  Medical_Records,
  Supply_Stock,
  Used_Supplies,
  Pets,
  Adoption,
  Donations
};

// Definir relaciones
// Owners pertenece a Sectors
Owners.belongsTo(Sectors, { foreignKey: 'id_sector' });
Sectors.hasMany(Owners, { foreignKey: 'id_sector' });

// Users pertenece a Roles
Users.belongsTo(Roles, { foreignKey: 'id_role', as: 'Role' });
Roles.hasMany(Users, { foreignKey: 'id_role' });

// Animal_Census pertenece a Owners y Sectors
Animal_Census.belongsTo(Owners, { foreignKey: 'id_owner' });
Owners.hasMany(Animal_Census, { foreignKey: 'id_owner' });
Animal_Census.belongsTo(Sectors, { foreignKey: 'id_sector' });
Sectors.hasMany(Animal_Census, { foreignKey: 'id_sector' });

// Complaints pertenece a Animal_Census y Sectors
Complaints.belongsTo(Animal_Census, { foreignKey: 'id_animal' });
Animal_Census.hasMany(Complaints, { foreignKey: 'id_animal' });
Complaints.belongsTo(Sectors, { foreignKey: 'id_sector' });
Sectors.hasMany(Complaints, { foreignKey: 'id_sector' });

// Medical_Day pertenece a Sectors
Medical_Day.belongsTo(Sectors, { foreignKey: 'id_sector' });
Sectors.hasMany(Medical_Day, { foreignKey: 'id_sector' });

// Day_Attendance pertenece a Medical_Day, Owners, Staff_Volunteers, Animal_Census
Day_Attendance.belongsTo(Medical_Day, { foreignKey: 'id_day' });
Medical_Day.hasMany(Day_Attendance, { foreignKey: 'id_day' });
Day_Attendance.belongsTo(Owners, { foreignKey: 'id_owner' });
Owners.hasMany(Day_Attendance, { foreignKey: 'id_owner' });
Day_Attendance.belongsTo(Staff_Volunteers, { foreignKey: 'id_staff' });
Staff_Volunteers.hasMany(Day_Attendance, { foreignKey: 'id_staff' });
Day_Attendance.belongsTo(Animal_Census, { foreignKey: 'id_animal' });
Animal_Census.hasMany(Day_Attendance, { foreignKey: 'id_animal' });

// Medical_Records pertenece a Animal_Census, Users, Medical_Day
Medical_Records.belongsTo(Animal_Census, { foreignKey: 'id_animal' });
Animal_Census.hasMany(Medical_Records, { foreignKey: 'id_animal' });
Medical_Records.belongsTo(Users, { foreignKey: 'id_vet_user' });
Users.hasMany(Medical_Records, { foreignKey: 'id_vet_user' });
Medical_Records.belongsTo(Medical_Day, { foreignKey: 'id_day' });
Medical_Day.hasMany(Medical_Records, { foreignKey: 'id_day' });

// Used_Supplies pertenece a Medical_Records y Supply_Stock
Used_Supplies.belongsTo(Medical_Records, { foreignKey: 'id_record' });
Medical_Records.hasMany(Used_Supplies, { foreignKey: 'id_record' });
Used_Supplies.belongsTo(Supply_Stock, { foreignKey: 'id_supply' });
Supply_Stock.hasMany(Used_Supplies, { foreignKey: 'id_supply' });

// Definir la relación: Un animal puede tener muchas solicitudes de adopción
Pets.hasMany(Adoption, { foreignKey: 'id_pet', as: 'applications' });
Adoption.belongsTo(Pets, { foreignKey: 'id_pet', as: 'pet' });

// Función para sincronizar la base de datos
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

sequelize.sync({ force: false }) // 'force: false' para que no borre nada si ya existen
  .then(() => {
    console.log("Tablas sincronizadas correctamente.");
  })
  .catch((err) => {
    console.error("Error al sincronizar tablas:", err);
  });
  
module.exports = {
  ...models,
  syncDatabase
};