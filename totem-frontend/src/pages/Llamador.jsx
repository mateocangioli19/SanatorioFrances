import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Llamador.css';

export default function Llamador() {
  const [turnoActual, setTurnoActual] = useState(null);
  const [ultimoTurnoHablado, setUltimoTurnoHablado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const api = import.meta.env.VITE_API_URL; // 👈 agregado

  useEffect(() => {
    obtenerTurnoLlamado();
    const interval = setInterval(obtenerTurnoLlamado, 5000);
    return () => clearInterval(interval);
  }, [ultimoTurnoHablado]);

  const obtenerTurnoLlamado = async () => {
    try {
      const response = await fetch(`${api}/turno-actual`);
      const data = await response.json();
      if (data && data.turno && data.turno !== ultimoTurnoHablado && !speechSynthesis.speaking) {
        if (turnoActual) {
          setHistorial(prev => [turnoActual, ...prev].slice(0, 4));
        }
        setTurnoActual(data);
        hablarTurno(data.turno, data.box);
      } else {
        setTurnoActual(data);
      }
    } catch (error) {
      console.error('Error al obtener el turno actual:', error);
    }
  };

  const hablarTurno = (turno, box) => {
    const audio = new Audio('/ding.mp3');
    audio.play().then(() => {
      const mensaje = new SpeechSynthesisUtterance(`Turno ${turno}, diríjase al ${box}`);
      mensaje.lang = 'es-ES';
      mensaje.rate = 1;
      mensaje.pitch = 1;
      mensaje.onend = () => setUltimoTurnoHablado(turno);
      speechSynthesis.speak(mensaje);
    });
  };

  return (
    <div className="llamador-container">
      {/* ENCABEZADO */}
      <div className="encabezado bg-primary text-white d-flex justify-content-between align-items-center px-4 py-2">
        <h1 className="mb-0">SISTEMA DE LLAMADOS</h1>
        <div className="text-end">
          <h4 className="mb-0">LOGO EMPRESA</h4>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="contenido d-flex">
        {/* COLUMNA IZQUIERDA */}
        <div className="columna-turnos d-flex flex-column flex-fill p-3">

          {/* TURNO ACTUAL */}
          <div className="celda-turno mb-4 flex-fill border rounded d-flex flex-column justify-content-center align-items-center turno-actual bg-light">
            {turnoActual && turnoActual.turno ? (
              <>
                <h2 className="fw-bold display-4">Turno {turnoActual.turno}</h2>
                <small className="text-primary">{turnoActual.box}</small>
              </>
            ) : (
              <span className="text-muted">Esperando turno...</span>
            )}
          </div>

          {/* TURNOS ANTERIORES */}
          <div className="historial-turnos">
            {historial.map((turno, idx) => (
              <div
                key={idx}
                className="celda-turno mb-3 border rounded d-flex flex-column justify-content-center align-items-center bg-white"
              >
                <h4 className="fw-bold">Turno {turno.turno}</h4>
                <small className="text-primary">{turno.box}</small>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="columna-imagen flex-fill">
          <img
            src="/institucional.jpg"
            alt="Institucional"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}
