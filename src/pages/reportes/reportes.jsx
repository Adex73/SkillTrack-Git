import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './reportes.css';

function Reportes() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({ nombre: 'Usuario', rol: 'Rol' });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        if (!storedUser) {
            navigate("/");
        } else {
            setUsuario(storedUser);
        }
    }, [navigate]);

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
                        <h2>1,240</h2>
                        <p>Estudiantes Activos</p>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-chalkboard-teacher"></i>
                        <h2>85</h2>
                        <p>Profesores Registrados</p>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-book-open"></i>
                        <h2>312</h2>
                        <p>Cursos Activos</p>
                    </div>

                    <div className="stat-card">
                        <i className="fas fa-chart-bar"></i>
                        <h2>89%</h2>
                        <p>Promedio Institucional</p>
                    </div>

                </div>

                {/* SECCIÓN DE REPORTES DETALLADOS */}
                <div className="report-section">

                    <div className="report-card">
                        <h3><i className="fas fa-chart-pie"></i> Rendimiento por Carrera</h3>
                        <p>Visualización del promedio general por cada programa académico.</p>
                        <button className="report-btn">Ver Reporte</button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-calendar-check"></i> Tasa de Entrega de Tareas</h3>
                        <p>Porcentaje de cumplimiento de actividades académicas.</p>
                        <button className="report-btn">Ver Reporte</button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-exclamation-triangle"></i> Alumnos en Riesgo</h3>
                        <p>Estudiantes con promedio menor a 70 o con inasistencias.</p>
                        <button className="report-btn alert">Ver Reporte</button>
                    </div>

                    <div className="report-card">
                        <h3><i className="fas fa-file-export"></i> Exportar Reportes</h3>
                        <p>Descargar datos en formato PDF o Excel.</p>
                        <button className="report-btn secondary">Exportar</button>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Reportes;