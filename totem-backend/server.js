
// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./turnos.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar con la BD:', err.message);
  } else {
    console.log('✅ Conectado a SQLite.');
  }
});

// Crear la tabla con campo de estado
db.run(`
  CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turno TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    llamado INTEGER DEFAULT 0,
    box TEXT,
    estado TEXT DEFAULT 'pendiente' -- pendiente | atendido | ausente | cancelado | derivado
  )
`);

// 📌 Obtener todos los turnos
app.get('/turnos', (req, res) => {
  db.all("SELECT * FROM turnos ORDER BY id ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los turnos' });
    res.json(rows);
  });
});

// 📌 Obtener turnos pendientes (solo los no atendidos)
app.get('/turnos-pendientes', (req, res) => {
  db.all("SELECT * FROM turnos WHERE estado = 'pendiente' ORDER BY id ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los turnos pendientes' });
    res.json(rows);
  });
});

// 📌 Agregar un nuevo turno
app.post('/turnos', (req, res) => {
  const { especialidad } = req.body;
  if (!especialidad) return res.status(400).json({ error: 'Especialidad requerida' });

  // Obtener el último número usado para esta especialidad
  db.get(
    "SELECT MAX(CAST(SUBSTR(turno, LENGTH(especialidad) + 1) AS INTEGER)) as ultimoNumero FROM turnos WHERE especialidad = ?", 
    [especialidad], 
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Error al obtener último turno' });

      const ultimoNumero = row.ultimoNumero || 0;
      const nuevoNumero = ultimoNumero + 1;
      const turno = `${especialidad}${nuevoNumero}`;

      db.run("INSERT INTO turnos (turno, especialidad, estado) VALUES (?, ?, 'pendiente')", [turno, especialidad], function (err) {
        if (err) return res.status(500).json({ error: 'Error al agregar el turno' });
        res.json({ message: '✅ Turno agregado', turno });
      });
    }
  );
});

// 📌 Llamar un turno desde Secretaría
app.post('/turno-actual', (req, res) => {
  const { turno, especialidad, box } = req.body;
  if (!turno || !especialidad || !box) {
    return res.status(400).json({ error: 'Faltan datos (turno, especialidad o box)' });
  }

  db.serialize(() => {
    // Resetear llamados anteriores
    db.run("UPDATE turnos SET llamado = 0", [], (err) => {
      if (err) return res.status(500).json({ error: 'Error al resetear llamados' });
    });

    // Marcar el turno actual como llamado y asignar box
    db.run(
      "UPDATE turnos SET llamado = 1, box = ? WHERE turno = ? AND especialidad = ? AND estado = 'pendiente'",
      [box, turno, especialidad],
      function (err) {
        if (err) return res.status(500).json({ error: 'Error al llamar el turno' });
        res.json({ message: '✅ Turno llamado', turno, especialidad, box });
      }
    );
  });
});

// 📌 Obtener el turno actualmente llamado
app.get('/turno-actual', (req, res) => {
  db.get("SELECT * FROM turnos WHERE llamado = 1 AND estado = 'pendiente'", (err, row) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el turno actual' });
    res.json(row || { turno: null, especialidad: null, box: null });
  });
});

// 📌 Marcar turno como atendido (finalizar atención)
app.put('/turnos/:id/atendido', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE turnos SET estado = 'atendido', llamado = 0 WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: 'Error al marcar como atendido' });
    res.json({ message: '✅ Turno marcado como atendido' });
  });
});

// 📌 Marcar turno como ausente
app.put('/turnos/:id/ausente', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE turnos SET estado = 'ausente', llamado = 0 WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: 'Error al marcar como ausente' });
    res.json({ message: '✅ Turno marcado como ausente' });
  });
});

// 📌 Marcar turno como cancelado
app.put('/turnos/:id/cancelado', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE turnos SET estado = 'cancelado', llamado = 0 WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: 'Error al marcar como cancelado' });
    res.json({ message: '✅ Turno marcado como cancelado' });
  });
});
// 📌 Derivar turno a otra especialidad (manteniendo el mismo número)
app.put('/turnos/:id/derivar', (req, res) => {
  const { id } = req.params;
  const { nuevaEspecialidad } = req.body;
  
  if (!nuevaEspecialidad) {
    return res.status(400).json({ error: 'nuevaEspecialidad es requerida' });
  }

  db.serialize(() => {
    // Primero obtener el turno actual
    db.get("SELECT * FROM turnos WHERE id = ?", [id], (err, turno) => {
      if (err) return res.status(500).json({ error: 'Error al obtener el turno' });
      if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });

      // Extraer el número del turno actual (ej: "Cardio1" -> "1")
      const numeroTurno = turno.turno.replace(turno.especialidad, '');
      const nuevoTurno = `${nuevaEspecialidad}${numeroTurno}`;

      // Actualizar el turno con la nueva especialidad y resetear llamado
      db.run(
        "UPDATE turnos SET especialidad = ?, turno = ?, llamado = 0 WHERE id = ?",
        [nuevaEspecialidad, nuevoTurno, id],
        function (err) {
          if (err) return res.status(500).json({ error: 'Error al derivar el turno' });
          res.json({ 
            message: '✅ Turno derivado exitosamente', 
            turnoAnterior: turno.turno,
            turnoNuevo: nuevoTurno,
            especialidadAnterior: turno.especialidad,
            especialidadNueva: nuevaEspecialidad
          });
        }
      );
    });
  });
});

// 📌 Obtener estadísticas
app.get('/estadisticas', (req, res) => {
  db.all(`
    SELECT 
      estado,
      COUNT(*) as cantidad,
      especialidad
    FROM turnos 
    GROUP BY estado, especialidad
    ORDER BY especialidad, estado
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener estadísticas' });
    res.json(rows);
  });
});


// 📌 Resetear todos los turnos (para pruebas)
app.delete('/reset-turnos', (req, res) => {
  db.run("DELETE FROM turnos", (err) => {
    if (err) return res.status(500).json({ error: 'Error al resetear turnos' });
    res.json({ message: '🧹 Todos los turnos fueron eliminados' });
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});