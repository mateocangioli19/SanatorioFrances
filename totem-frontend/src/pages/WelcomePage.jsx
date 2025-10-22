import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './WelcomePage.css';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const goToSection = (section) => {
    if (section === 'doctor/secretaria') {
      const usuario = localStorage.getItem('usuario');
      const box = localStorage.getItem('box');
    
    }

    navigate(`/${section}`);
    setIsDoctorMenuOpen(false); // Cierra el menú al hacer clic
  };

  const toggleDoctorMenu = () => {
    setIsDoctorMenuOpen((prev) => !prev);
  };

  // Detectar clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDoctorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="welcome-page">
      <nav className="navbar-custom">
        <div className="nav-left">
          <button onClick={() => goToSection('admin')}>Empresa</button>
          <button onClick={() => goToSection('doctor')}>Nosotros</button>
        </div>

        <div className="navbar-center">
          <span className="brand-name">SANATORIO FRANCES</span>
        </div>

        <div className="nav-right">
          
          {/* Dropdown */}
          <div className="dropdown" ref={dropdownRef}>
            <button className="dropdown-toggle" onClick={toggleDoctorMenu}>
              INGRESAR
            </button>
            {isDoctorMenuOpen && (
              <div className="dropdown-menu show">
                <button onClick={() => goToSection('doctor/totem')}>Totem</button>
                <button onClick={() => goToSection('doctor/llamador')}>Llamador</button>
                <button onClick={() => goToSection('doctor/secretaria')}>Secretaría</button>
                <button onClick={() => goToSection('doctor/llamadorpacientes')}>Llamador de Pacientes</button> {/* Nuevo botón */}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="welcome-content">
        <img src="/logo.png" alt="Logo SANATORIO" className="logo" />
        <h1 className="main-title">El Software que va a hacer crecer tu empresa</h1>
        <h2 className="subtitle">S F </h2>
        <p className="tagline">SOFTWARE DE ATENCIÓN</p>
      </div>
    </div>
  );
}
