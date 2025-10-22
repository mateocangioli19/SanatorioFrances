import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPhoneAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import './Secretaria.css';

export default function Secretaria() {
  const [turnos, setTurnos] = useState([]);
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState([]);
  const [error, setError] = useState('');
  const [turnoActual, setTurnoActual] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [turnoLlamadoActual, setTurnoLlamadoActual] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  const usuario = sessionStorage.getItem('usuario');
  const box = sessionStorage.getItem('box');

  useEffect(() => {
    if (!usuario || !box) navigate('/perfil');
  }, [navigate, usuario, box]);

  useEffect(() => {
    obtenerTurnosPendientes();
    obtenerTurnoActual();
    const interval = setInterval(() => {
      obtenerTurnosPendientes();
      obtenerTurnoActual();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => {
        setMensajeExito('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  const obtenerTurnosPendientes = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${api}/turnos-pendientes`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Asegurarnos de que data sea un array
      if (Array.isArray(data)) {
        setTurnos(data);
      } else {
        console.error('La API no devolvió un array:', data);
        setTurnos([]);
        setError('Error: Formato de datos incorrecto');
      }
    } catch (err) {
      console.error('Error al obtener los turnos:', err);
      setError('Error al obtener los turnos');
      setTurnos([]);
    } finally {
      setCargando(false);
    }
  };

  const obtenerTurnoActual = async () => {
    try {
      const response = await fetch(`${api}/turno-actual`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTurnoLlamadoActual(data.turno ? data : null);
    } catch (err) {
      console.error('Error al obtener turno actual:', err);
      setTurnoLlamadoActual(null);
    }
  };

  const llamarTurno = async (turno) => {
    try {
      const response = await fetch(`${api}/turno-actual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turno: turno.turno,
          especialidad: turno.especialidad,
          box: box
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTurnoActual(turno);
        setMostrarOpciones(true);
        setTurnoLlamadoActual({
          ...turno,
          box: box
        });
        setMensajeExito(`Turno ${turno.turno} llamado exitosamente`);
        obtenerTurnosPendientes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al llamar turno');
      }
    } catch (err) {
      console.error('Error al llamar turno:', err);
      setError(err.message || 'Error al llamar el turno');
    }
  };

  const manejarReLlamar = async () => {
    if (!turnoActual) return;
    
    try {
      const response = await fetch(`${api}/turno-actual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turno: turnoActual.turno,
          especialidad: turnoActual.especialidad,
          box: box
        }),
      });

      if (response.ok) {
        setMensajeExito(`Turno ${turnoActual.turno} re-llamado exitosamente`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al re-llamar turno');
      }
    } catch (err) {
      console.error('Error al re-llamar turno:', err);
      setError(err.message || 'Error al re-llamar el turno');
    }
  };

  const manejarAusente = async () => {
    if (!turnoActual) return;
    
    try {
      const response = await fetch(`${api}/turnos/${turnoActual.id}/ausente`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMensajeExito(`Turno ${turnoActual.turno} marcado como ausente`);
        setMostrarOpciones(false);
        setTurnoActual(null);
        setTurnoLlamadoActual(null);
        obtenerTurnosPendientes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al marcar como ausente');
      }
    } catch (err) {
      console.error('Error al marcar como ausente:', err);
      setError(err.message || 'Error al marcar como ausente');
    }
  };

  const manejarCancelar = async () => {
    if (!turnoActual) return;
    
    try {
      const response = await fetch(`${api}/turnos/${turnoActual.id}/cancelado`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMensajeExito(`Turno ${turnoActual.turno} cancelado exitosamente`);
        setMostrarOpciones(false);
        setTurnoActual(null);
        setTurnoLlamadoActual(null);
        obtenerTurnosPendientes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cancelar turno');
      }
    } catch (err) {
      console.error('Error al cancelar turno:', err);
      setError(err.message || 'Error al cancelar el turno');
    }
  };

  const manejarDerivar = async () => {
    if (!turnoActual) return;
  
    try {
      const response = await fetch(`${api}/turnos/${turnoActual.id}/derivar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        nuevaEspecialidad: 'Caja'
      }),
    });

      if (response.ok) {
        const data = await response.json();
        setMensajeExito(`Turno ${turnoActual.turno} derivado a Caja exitosamente. Nuevo: ${data.turnoNuevo}`);
        setMostrarOpciones(false);
        setTurnoActual(null);
        setTurnoLlamadoActual(null);
        obtenerTurnosPendientes();
      }   else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al derivar turno');
      }

    } catch (err) {
      console.error('Error al derivar turno:', err);
      setError(err.message || 'Error al derivar el turno');
    }
  };
  const finalizarAtencion = async () => {
    if (!turnoLlamadoActual) return;
    
    try {
      const response = await fetch(`${api}/turnos/${turnoLlamadoActual.id}/atendido`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMensajeExito(`Atención del turno ${turnoLlamadoActual.turno} finalizada`);
        setTurnoLlamadoActual(null);
        obtenerTurnosPendientes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al finalizar atención');
      }
    } catch (err) {
      console.error('Error al finalizar atención:', err);
      setError(err.message || 'Error al finalizar atención');
    }
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('box');
    navigate('/perfil');
  };

  // Asegurarnos de que turnos sea un array antes de usar map
  const especialidades = Array.isArray(turnos) 
    ? [...new Set(turnos.map((t) => t.especialidad))] 
    : [];

  const turnosFiltrados = Array.isArray(turnos)
    ? (especialidadesSeleccionadas.length === 0
        ? turnos
        : turnos.filter((t) => especialidadesSeleccionadas.includes(t.especialidad)))
    : [];

  const toggleEspecialidad = (esp) => {
    setEspecialidadesSeleccionadas((prev) =>
      prev.includes(esp) ? prev.filter((e) => e !== esp) : [...prev, esp]
    );
  };

  if (!usuario || !box) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Redirigiendo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="secretaria-container">
      {/* HEADER */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <div className="header-left">
          <div className="fw-bold text-primary">Fragueiro 1952</div>
          <div className="text-muted small">PUESTO</div>
          <select className="form-select form-select-sm w-auto" disabled>
            <option>{box}</option>
          </select>
        </div>

        <div className="header-center">
          <div className="text-muted small">Filtrar por especialidad:</div>
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle btn-sm"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {especialidadesSeleccionadas.length > 0
                ? especialidadesSeleccionadas.join(', ')
                : 'Todas'}
            </button>
            <ul className="dropdown-menu">
              {especialidades.map((esp) => (
                <li key={esp} className="px-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={esp}
                      id={`chk-${esp}`}
                      checked={especialidadesSeleccionadas.includes(esp)}
                      onChange={() => toggleEspecialidad(esp)}
                    />
                    <label className="form-check-label" htmlFor={`chk-${esp}`}>
                      {esp}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
            {Array.isArray(turnosFiltrados) ? turnosFiltrados.length : 0} turnos pendientes
          </span>
        </div>
      </div>

      {/* MENSAJES DE ÉXITO */}
      {mensajeExito && (
        <div className="alert alert-success mt-3 alert-dismissible fade show" role="alert">
          {mensajeExito}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMensajeExito('')}
          ></button>
        </div>
      )}

      {/* TURNO ACTUAL LLAMADO */}
      {turnoLlamadoActual && (
        <div className="alert alert-info mt-3 d-flex justify-content-between align-items-center">
          <div>
            <strong>Turno actual: {turnoLlamadoActual.turno}</strong> 
            ({turnoLlamadoActual.especialidad}) - Box {turnoLlamadoActual.box}
          </div>
          <Button variant="success" onClick={finalizarAtencion}>
            Finalizar Atención
          </Button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3 alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* TABLA DE TURNOS PENDIENTES */}
      {cargando ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando turnos...</span>
          </div>
        </div>
      ) : (
        <table className="table table-bordered mt-4">
          <thead className="table-light">
            <tr>
              <th>Turno</th>
              <th>Especialidad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(turnosFiltrados) && turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>
                  <strong>{turno.turno}</strong>
                </td>
                <td>{turno.especialidad}</td>
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
            {(!Array.isArray(turnosFiltrados) || turnosFiltrados.length === 0) && (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  No hay turnos pendientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* MODAL OPCIONES */}
      <Modal show={mostrarOpciones} onHide={() => setMostrarOpciones(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Opciones para: {turnoActual?.turno}</Modal.Title>
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
            <Button variant="info" onClick={manejarDerivar}>
              Derivar a Consulta General
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <small className="text-muted">
            El turno seguirá siendo el actual hasta que finalice la atención
          </small>
        </Modal.Footer>
      </Modal>
    </div>
  );
}