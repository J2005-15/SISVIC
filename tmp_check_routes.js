try {
  require('./src/routes/index');
  console.log('routes OK');
} catch (error) {
  console.error(error);
  process.exit(1);
}
