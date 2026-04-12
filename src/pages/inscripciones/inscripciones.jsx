import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './inscripciones.css';

function Inscripciones() {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const [cursoId, setCursoId] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // 1. Validar sesión y obtener cursoId del storage
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const idCurso = localStorage.getItem("cursoId");

        if (!usuario || usuario.rol !== "profesor") {
            navigate("/");
            return;
        }

        setUserSession(usuario);
        setCursoId(idCurso);
    }, [navigate]);

    // 2. Cargar inscripciones actuales
    const cargarInscritos = useCallback(async (id) => {
        try {
            const res = await fetch(`/inscripciones/${id}`);
            const data = await res.json();
            setInscritos(data);
            return data;
        } catch (error) {
            console.error("Error cargando inscritos:", error);
            return [];
        }
    }, []);

    // 3. Cargar estudiantes filtrados por universidad y búsqueda
    const cargarEstudiantes = useCallback(async (texto = "") => {
        if (!userSession || !cursoId) return;

        try {
            await cargarInscritos(cursoId);
            const res = await fetch(`/estudiantes/buscar?texto=${texto}&universidad=${userSession.universidad}`);
            const data = await res.json();
            setEstudiantes(data);
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
        }
    }, [userSession, cursoId, cargarInscritos]);

    useEffect(() => {
        if (userSession && cursoId) {
            cargarEstudiantes();
        }
    }, [userSession, cursoId, cargarEstudiantes]);

    const handleSearch = (e) => {
        e.preventDefault();
        cargarEstudiantes(busqueda);
    };

    const estaInscrito = (estudianteId) => {
        return inscritos.some(i => i.estudianteId === estudianteId);
    };

    const toggleInscripcion = async (estudianteId) => {
        const inscrito = estaInscrito(estudianteId);
        const method = inscrito ? "DELETE" : "POST";

        try {
            const res = await fetch("/inscripciones", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cursoId, estudianteId })
            });

            const data = await res.json();
            alert(data.mensaje || data.error);
            cargarEstudiantes(busqueda);
        } catch (error) {
            alert("Error en la operación");
        }
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    if (!userSession) return null;

    return (
        <div className="dashboard-container">
            {/* SIDEBAR */}
            <div className="sidebar">
                <div>
                    <div className="profile">
                        <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" />
                        <h3>{userSession.nombre}</h3>
                        <p>{userSession.rol.charAt(0).toUpperCase() + userSession.rol.slice(1)}</p>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/mis-cursos"><i className="fas fa-arrow-left"></i> Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso"><i className="fas fa-stream"></i> Contenido</Link></li>
                        <li><Link to="/tareas"><i className="fas fa-tasks"></i> Tareas</Link></li>
                        <li><Link to="/calificaciones"><i className="fas fa-chart-bar"></i> Calificaciones</Link></li>
                        <li><Link to="/reportes"><i className="fas fa-chart-line"></i> Reportes</Link></li>
                        <li><Link to="/inscripciones" className="active"><i className="fas fa-user-plus"></i> Inscripciones</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            {/* MAIN */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Inscribir Estudiantes</h1>
                </div>

                <div className="card-box">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o matrícula"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <button type="submit">
                            <i className="fas fa-search"></i> Buscar
                        </button>
                    </form>
                </div>

                <div className="card-box">
                    <h2>Resultados</h2>
                    <ul className="lista">
                        {estudiantes.length === 0 ? (
                            <li>No se encontraron estudiantes</li>
                        ) : (
                            estudiantes.map(e => (
                                <li key={e._id}>
                                    <div>
                                        <strong>{e.nombre}</strong><br />
                                        Matrícula: {e.matricula}
                                    </div>
                                    <button 
                                        className={estaInscrito(e._id) ? 'btn-remove' : 'btn-add'}
                                        onClick={() => toggleInscripcion(e._id)}
                                    >
                                        {estaInscrito(e._id) 
                                            ? <><i className="fas fa-user-minus"></i> Quitar</>
                                            : <><i className="fas fa-user-plus"></i> Inscribir</>
                                        }
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Inscripciones;