import './App.css'
import './Login.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Docentes from './pages/Docentes'
import Cumpleanos from './pages/Cumpleanos'
import Configuracion from './pages/Configuracion'
import Ayuda from './pages/Ayuda'
import Equipo from './pages/Equipo'
import MisDatos from './pages/MisDatos'
import CerrarSesion from './pages/CerrarSesion'
import Login from './pages/Login'
import Layout from './Layout'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docentes" element={<Docentes />} />
        <Route path="/cumpleanos" element={<Cumpleanos />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/mis-datos" element={<MisDatos />} />
        <Route path="/logout" element={<CerrarSesion />} />
      </Route>
    </Routes>
  )
}

export default App
