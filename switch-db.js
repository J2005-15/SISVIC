#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const args = process.argv.slice(2);
const target = args[0];

if (!target || !['local', 'remote'].includes(target)) {
  console.error('❌ Uso: node switch-db.js [local|remote]');
  process.exit(1);
}

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/^DB_ENV=.*/m, `DB_ENV=${target}`);
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Base de datos cambiada a: ${target}`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
