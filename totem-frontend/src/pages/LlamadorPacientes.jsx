// src/components/LlamadorPacientes/LlamadorPacientes.jsx
import React, { useState, useEffect } from 'react';
import './LlamadorPacientes.css';

function LlamadorPacientes() {
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    // 🔒 Código comentado hasta tener acceso a la base de datos con nombres de pacientes

    /*
    const fetchLlamado = () => {
      axios.get('http://localhost:3000/api/turnos/llamado')
        .then(response => {
          setPaciente(response.data);
        })
        .catch(error => {
          console.error('Error al obtener paciente llamado:', error);
        });
    };

    fetchLlamado();
    const interval = setInterval(fetchLlamado, 3000);
    return () => clearInterval(interval);
    */
  }, []);

  return (
    <div className="llamador-pacientes">
      <div className="display-container">
        <h1 className="titulo">Llamado de Pacientes</h1>
        {paciente ? (
          <h2 className="paciente-nombre">{paciente.nombre} {paciente.apellido}</h2>
        ) : (
          <h2 className="paciente-nombre">Esperando próximo llamado...</h2>
        )}
      </div>
    </div>
  );
}

export default LlamadorPacientes;
