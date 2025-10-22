import React from 'react';

export default function TurnoDisplay({ turno, especialidad }) {
  return (
    <div className="alert alert-success text-center mt-4">
      <h4>¡Registro Exitoso!</h4>
      <p>Especialidad seleccionada: <strong>{especialidad}</strong></p>
      <p>Su número de turno es: <strong>{turno}</strong></p>
    </div>
  );
}
