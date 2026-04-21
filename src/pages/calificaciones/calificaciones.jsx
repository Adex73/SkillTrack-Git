import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './calificaciones.css';

function Calificaciones() {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState({ nombre: 'Usuario', rol: 'Rol' });

    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            navigate("/"); // Redirige al login si no hay sesión
        } else {
            setUserSession(usuario);
        }
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className="dashboard-container">

            {/* SIDEBAR */}
            <div className="sidebar">
                <div>
                    <div className="profile">
                        <img src="https://i.pravatar.cc/150?img=12" alt="Perfil de Usuario" />
                        <h3 id="nombreUsuario">{userSession.nombre}</h3>
                        <p id="rolUsuario" style={{ color: '#cbd5ff', fontSize: '13px' }}>
                            {userSession.rol.charAt(0).toUpperCase() + userSession.rol.slice(1)}
                        </p>
                    </div>

                    <ul className="nav-links">
                        <li><Link to="/mis-cursos"><i className="fas fa-arrow-left"></i> Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso"><i className="fas fa-stream"></i> Contenido</Link></li>
                        <li><Link to="/tareas"><i className="fas fa-tasks"></i> Tareas</Link></li>
                        <li><Link to="/calificaciones" className="active"><i className="fas fa-chart-bar"></i> Calificaciones</Link></li>
                        <li><Link to="/reportes"><i className="fas fa-chart-line"></i> Reportes</Link></li>
                        <li><Link to="/inscripciones"><i className="fas fa-user-plus"></i> Inscripciones</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">

                <div className="topbar">
                    <h1>Calificaciones</h1>
                </div>

                {/* PROMEDIO GENERAL */}
                <div className="summary-card">
                    <h2>Promedio General</h2>
                    <div className="average-score">92</div>
                    <p>Excelente desempeño 👏</p>
                </div>

                {/* TABLA */}
                <div className="grades-table-container">
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Actividad</th>
                                <th>Tipo</th>
                                <th>Calificación</th>
                                <th>Valor (%)</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Proyecto HTML</td><td>Tarea</td><td className="grade high">95</td><td>20%</td><td>25 Sept 2026</td></tr>
                            <tr><td>Ejercicio Flexbox</td><td>Tarea</td><td className="grade medium">85</td><td>15%</td><td>10 Sept 2026</td></tr>
                            <tr><td>Examen Parcial</td><td>Examen</td><td className="grade high">93</td><td>30%</td><td>5 Oct 2026</td></tr>
                            <tr><td>Proyecto Final</td><td>Proyecto</td><td className="grade high">98</td><td>35%</td><td>15 Nov 2026</td></tr>
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
    );
}

export default Calificaciones;