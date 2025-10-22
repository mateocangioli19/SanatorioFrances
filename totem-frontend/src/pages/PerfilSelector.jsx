import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function PerfilSelector() {
  const [usuario, setUsuario] = useState('');
  const [box, setBox] = useState('');
  const navigate = useNavigate();

  const ingresar = () => {
    if (usuario && box) {
      // 👉 Cambié localStorage por sessionStorage
      sessionStorage.setItem('usuario', usuario);
      sessionStorage.setItem('box', box);
      navigate('/doctor/secretaria');
    } else {
      alert('Por favor selecciona un nombre y un box.');
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <h2 className="mb-4">Seleccionar Perfil</h2>

      <div className="mb-3 w-50">
        <label className="form-label">Nombre del usuario:</label>
        <select
          className="form-select"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="Cangioli Mateo">Cangioli Mateo</option>
          <option value="González Laura">González Laura</option>
          <option value="Pérez Juan">Pérez Juan</option>
        </select>
      </div>

      <div className="mb-3 w-50">
        <label className="form-label">Seleccionar Box:</label>
        <select
          className="form-select"
          value={box}
          onChange={(e) => setBox(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="BOX 01">BOX 01 - </option>
          <option value="BOX 02">BOX 02 - </option>
          <option value="CAJA">Caja - </option>
        </select>
      </div>

      <button className="btn btn-primary mt-3" onClick={ingresar}>
        Ingresar
      </button>
    </div>
  );
}
