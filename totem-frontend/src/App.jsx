import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TurnoProvider } from './components/TurnoContext';
import WelcomePage from './pages/WelcomePage';
import Totem from './pages/Totem';
import Llamador from './pages/Llamador';
import Secretaria from './pages/Secretaria';
import Caja from './pages/Caja';
import Doctor from './pages/Doctor';
import PerfilSelector from './pages/PerfilSelector';
import LlamadorPacientes from './pages/LlamadorPacientes';

function App() {
  return (
    <TurnoProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/perfil" element={<PerfilSelector />} />
          <Route path="/doctor/totem" element={<Totem />} />
          <Route path="/doctor/llamador" element={<Llamador />} />
          <Route path="/doctor/secretaria" element={<Secretaria />} />
          <Route path="/doctor/caja" element={<Caja />} />
          <Route path="/doctor/llamadorPacientes" element={<LlamadorPacientes />} />
          <Route path="/doctor" element={<Doctor />} />
        </Routes>
      </Router>
    </TurnoProvider>
  );
}

export default App;
