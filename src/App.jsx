import { Routes, Route } from 'react-router-dom'
import Login from './pages/login/login.jsx'
import Registro from './pages/registro/registro.jsx'
import Index from './pages/index/index.jsx'
import Calificaciones from './pages/calificaciones/calificaciones.jsx'
import Carreras from './pages/carreras/carreras.jsx'
import Cursos from './pages/cursos/cursos.jsx'
import Inscripciones from './pages/inscripciones/inscripciones.jsx'
import MisCursos from './pages/mis-cursos/mis-cursos.jsx'
import DatosCurso from './pages/mis-cursos/datos-curso.jsx'
import Reportes from './pages/reportes/reportes.jsx'
import Tareas from './pages/tareas/tareas.jsx'
import Universidades from './pages/universidades/universidades.jsx'

function App() {
  return (
    <Routes>
        <Route path="/" element={ <Login /> } />
        <Route path="/dashboard" element={ <Index /> } />
        <Route path="/usuarios" element={ <Registro /> } />
        <Route path="/calificaciones" element={ <Calificaciones /> } />
        <Route path="/carreras" element={ <Carreras /> } />
        <Route path="/cursos" element={ <Cursos /> } />
        <Route path="/inscripciones" element={ <Inscripciones /> } />
        <Route path="/mis-cursos" element={ <MisCursos /> } />
        <Route path="/mis-cursos/datos-curso" element={ <DatosCurso /> } />
        <Route path="/reportes" element={ <Reportes /> } />
        <Route path="/tareas" element={ <Tareas /> } />
        <Route path="/universidades" element={ <Universidades /> } />
      </Routes>
  );
}

export default App;