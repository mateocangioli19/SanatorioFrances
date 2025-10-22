const Database = require('better-sqlite3');
const db = new Database('./turnos.db', { verbose: console.log });

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turno TEXT NOT NULL,
      especialidad TEXT NOT NULL,
      llamado INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
