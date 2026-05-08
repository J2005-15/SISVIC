const { sequelize } = require('./src/config/database');

(async () => {
  try {
    const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Users';");
    console.log(results);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
})();
