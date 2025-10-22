import React, { createContext, useState, useContext } from 'react';

const TurnoContext = createContext();

export const TurnoProvider = ({ children }) => {
  const [turnos, setTurnos] = useState([]);

  const agregarTurno = (numero, especialidad) => {
    setTurnos(prevTurnos => [...prevTurnos, { turno: numero, especialidad }]);
    console.log("Turno agregado:", { turno: numero, especialidad }); // 🛠 DEBUG
  };

  return (
    <TurnoContext.Provider value={{ turnos, setTurnos, agregarTurno }}>
      {children}
    </TurnoContext.Provider>
  );
};

export const useTurnos = () => {
  const context = useContext(TurnoContext);
  if (!context) {
    throw new Error("useTurnos debe estar dentro de un TurnoProvider");
  }
  return context;
};
