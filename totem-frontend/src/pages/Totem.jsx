import React, { useState, useEffect } from 'react';
import './Totem.css';
import qz from "qz-tray"; // <-- importante instalar qz-tray en tu proyecto

export default function Totem() {
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = import.meta.env.VITE_API_URL;

  const especialidades = [
    { id: 'R', nombre: 'RECEPCION', clase: 'btn-turno' },
    { id: 'L', nombre: 'LABORATORIO', clase: 'btn-extraccion' },
  ];

  // Función para imprimir en la POS80 via QZ Tray
  async function imprimirTurno(turno) {
    try {
      await qz.websocket.connect();

      const config = qz.configs.create("POS80"); // <-- nombre exacto de la impresora en Windows

      const datos = [
        '\x1B\x40',             // Reset impresora
        '\x1B\x61\x01',         // Centrar texto
        "SANATORIO FRANCÉS\n",
        "Turno N° " + turno + "\n",
        "\n\n\n",
        '\x1D\x56\x41'           // Cortar papel
      ];

      await qz.print(config, datos);
      console.log("✅ Ticket impreso correctamente");
      qz.websocket.disconnect();

    } catch (err) {
      console.error("❌ Error al imprimir:", err);
    }
  }

  const generarTurno = async (especialidad) => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ especialidad }),
      });
      const data = await res.json();
      setTurno(data.turno);

      // 🖨️ Imprimir el turno en la POS80 del tótem
      imprimirTurno(data.turno);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (turno) {
      const timer = setTimeout(() => setTurno(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [turno]);

  return (
    <div className="totem-container d-flex flex-column align-items-center text-center">
      <img src="/logo_sf.png.png" alt="Sanatorio Francés" className="logo-img" />
      <p className="instrucciones">Seleccione una opción</p>

      <div className="botones-container">
        {especialidades.map((esp) => (
          <button
            key={esp.id}
            className={`btn-totem ${esp.clase}`}
            onClick={() => generarTurno(esp.id)}
            disabled={loading}
          >
            {loading ? 'Generando...' : esp.nombre}
          </button>
        ))}
      </div>

      {turno && (
        <div
          className="turno-emergente"
          onClick={() => setTurno(null)}
        >
          <h3>🎟️ Tu turno es:</h3>
          <h1 className="turno-numero">{turno}</h1>
          <p>Espere a ser llamado en pantalla</p>
        </div>
      )}

      {!turno && <div className="mensaje-espera"></div>}
    </div>
  );
}
