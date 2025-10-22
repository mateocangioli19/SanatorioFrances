import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPhoneAlt } from 'react-icons/fa';
import './Caja.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

export default function Caja() {
  const [turnos, setTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const usuario = localStorage.getItem('usuario');
  const box = localStorage.getItem('box');

  // Redirigir si no hay perfil
  useEffect(() => {
    if (!usuario || !box) {
      navigate('/perfil');
    }
  }, [navigate]);

  if (!usuario || !box) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Redirigiendo...</span>
        </div>
      </div>
    );
  }

  // Obtener turnos derivados
  useEffect(() => {
    obtenerTurnos();
    const interval = setInterval(obtenerTurnos, 5000);
    return () => clearInterval(interval);
  }, []);

  const obtenerTurnos = async () => {
    try {
      const response = await fetch('http://localhost:5000/turnos');
      const data = await response.json();
      // Filtrar solo los turnos que fueron derivados a Caja
      const turnosCaja = data.filter(t => t.especialidad === 'CAJA');
      setTurnos(turnosCaja);
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
      setError('Error al obtener los turnos');
    }
  };

  const llamarTurno = async (turno) => {
    try {
      await fetch('http://localhost:5000/turnos/llamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turno),
      });
      setTurnoActual(turno); // Guardar turno actual
      setMostrarOpciones(true); // Mostrar opciones
      obtenerTurnos();
    } catch (error) {
      console.error('Error al llamar turno:', error);
      setError('Error al llamar el turno');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('box');
    navigate('/perfil');
  };

  // Funciones de acción
  const manejarReLlamar = () => {
    console.log('Re-llamar:', turnoActual);
    setMostrarOpciones(false);
  };

  const manejarAusente = () => {
    console.log('Ausente:', turnoActual);
    setMostrarOpciones(false);
  };

  const manejarCancelar = () => {
    console.log('Cancelar:', turnoActual);
    setMostrarOpciones(false);
  };

  return (
    <div className="caja-container">
      <div className="header-bar d-flex justify-content-between align-items-center">
        <div className="header-left">
          <div className="fw-bold text-primary">CAJA</div>
          <div className="text-muted small">Puestos</div>
          <select className="form-select form-select-sm w-auto">
            <option>{box}</option>
          </select>
        </div>

        <div className="header-right d-flex align-items-center gap-3">
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle user-name"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {usuario}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <button className="dropdown-item">Perfil</button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>

          <span className="badge bg-warning text-dark">
            {turnos.length} turnos pendientes
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <table className="table table-bordered mt-4">
        <thead className="table-light">
          <tr>
            <th>Turno</th>
            <th>Tiempo de espera</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id}>
              <td>
                <strong>{turno.turno}</strong> ({turno.especialidad})
              </td>
              <td>00:00 min.</td>
              <td>
                <button
                  className="btn btn-success d-flex align-items-center"
                  onClick={() => llamarTurno(turno)}
                >
                  Llamar <FaPhoneAlt className="ms-2" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL OPCIONES */}
      <Modal show={mostrarOpciones} onHide={() => setMostrarOpciones(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Opciones para el turno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={manejarReLlamar}>
              Re-llamar
            </Button>
            <Button variant="warning" onClick={manejarAusente}>
              Ausente
            </Button>
            <Button variant="danger" onClick={manejarCancelar}>
              Cancelar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
