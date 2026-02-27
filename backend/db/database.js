const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './db/documents.db';
const dbDir = path.dirname(dbPath);

// Criar pasta se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  db.exec(schema, (err) => {
    if (err) {
      console.error('Erro ao executar schema:', err.message);
    } else {
      console.log('✓ Banco de dados inicializado');
    }
  });
}

module.exports = db;
