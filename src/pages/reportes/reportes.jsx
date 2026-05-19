import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './reportes.css';


function Reportes() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({ nombre: 'Usuario', rol: 'Rol' });
  const [stats, setStats] = useState({
        estudiantes: 0,
        profesores: 0,
        cursos: 0
    });
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        if (!storedUser) {
            navigate("/");
        } else {
            setUsuario(storedUser);
        }
    }, [navigate]);

        useEffect(() => {
        const obtenerStats = async () => {
            try {
                const res = await fetch("http://localhost:5000/reportes/stats");
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Error cargando stats:", error);
            }
        };

        obtenerStats();
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className="dashboard-container">

            {/* SIDEBAR */}
            <div className="sidebar">
                <div>
                    <div className="profile">
                        <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" />
                        <h3 id="nombreUsuario">{usuario.nombre}</h3>
                        <p id="rolUsuario" style={{ color: '#cbd5ff', fontSize: '13px' }}>
                            {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                        </p>
                    </div>

                    <ul className="nav-links">
                        <li><Link to="/mis-cursos"><i className="fas fa-arrow-left"></i> Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso"><i className="fas fa-stream"></i> Contenido</Link></li>
                        <li><Link to="/tareas"><i className="fas fa-tasks"></i> Tareas</Link></li>
                        <li><Link to="/calificaciones"><i className="fas fa-chart-bar"></i> Calificaciones</Link></li>
                        <li><Link to="/reportes" className="active"><i className="fas fa-chart-line"></i> Reportes</Link></li>
                        <li><Link to="/inscripciones"><i className="fas fa-user-plus"></i> Inscripciones</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <a href="#!" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">

                <div className="topbar">
                    <h1>Reportes Académicos</h1>
                    <p>Análisis general del rendimiento institucional</p>
                </div>

                {/* MÉTRICAS PRINCIPALES */}
                <div className="stats-grid">

                    <div className="stat-card">
                        <i className="fas fa-user-graduate"></i>
                        <h2>{stats.estudiantes}</h2>
                        <p>Estudiantes Activos</p>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-chalkboard-teacher"></i>
                        <h2>{stats.profesores}</h2>
                        <p>Profesores Registrados</p>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-book-open"></i>
                        <h2>{stats.cursos}</h2>
                        <p>Cursos Activos</p>
                    </div>

                

                </div>

                {/* SECCIÓN DE REPORTES DETALLADOS */}
                <div className="report-section">

                    <div className="report-card">
                        <h3><i className="fas fa-chart-pie"></i> Cursos con alumnos inscritos</h3>
                        <p>Visualización del alumnado por cursos.</p>
                       <button
                            className="report-btn"
                            onClick={async () => {
                                const res = await fetch("http://localhost:5000/reportes/cursos-alumnos/txt");

                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);

                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "reporte.txt";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }}
                        >
                            Ver Reporte
                        </button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-calendar-check"></i> Alumnos inscritos a universidad</h3>
                        <p>Visualizacion del alumnado de la universidad.</p>
                        <button
                            className="report-btn"
                            onClick={async () => {
                                const res = await fetch("http://localhost:5000/reportes/alumnos-universidad/txt");

                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);

                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "alumnos_universidad.txt";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }}
                        >
                            Ver Reporte Universidades
                        </button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-exclamation-triangle"></i> Rendimiento de cursos</h3>
                        <p>Tareas vs entregas.</p>
                        <button
                            className="report-btn"
                            onClick={async () => {
                                const res = await fetch("http://localhost:5000/reportes/rendimiento-cursos/txt");

                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);

                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "rendimiento_cursos.txt";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }}
                        >
                            Ver Reporte Rendimiento
                        </button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-file-export"></i> Actividad</h3>
                        <p>Actividad reciente</p>
                        <button
                            className="report-btn"
                            onClick={async () => {
                                const res = await fetch("http://localhost:5000/reportes/actividad-estudiantes/txt");

                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);

                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "actividad_estudiantes.txt";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }}
                        >
                            Ver Reporte Estudiantes
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Reportes;