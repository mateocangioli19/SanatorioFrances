const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./turnos.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar con la BD:', err.message);
  } else {
    console.log('✅ Conectado a SQLite.');
  }
});

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
