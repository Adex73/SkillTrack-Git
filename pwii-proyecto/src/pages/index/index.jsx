import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css'

function Index() {
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
        <div className='index-page-wrapper'>
            <div className="dashboard-container">

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
                            <li><Link to="/dashboard" className="active"><i className="fas fa-home"></i> Dashboard</Link></li>
                            <li><Link to="/mis-cursos"><i className="fas fa-book"></i> Mis Cursos</Link></li>
                            <li><Link to="/usuarios"><i className="fas fa-users"></i> Usuarios</Link></li>
                        </ul>
                    </div>

                    <div className="logout">
                        <a href="#!" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="main-content">

                    <div className="topbar">
                        <h1 id="bienvenida">Bienvenido, {usuario.nombre} 👋</h1>
                        <i className="fas fa-bars menu-icon"></i>
                    </div>

                    {/* RESUMEN PERSONAL */}
                    <div className="cards">
                        <div className="card">
                            <h2>4</h2>
                            <p>Cursos Activos</p>
                        </div>

                        <div className="card">
                            <h2>12</h2>
                            <p>Tareas por Revisar</p>
                        </div>

                        <div className="card">
                            <h2>3</h2>
                            <p>Entregas Recientes</p>
                        </div>

                        <div className="card">
                            <h2>5</h2>
                            <p>Notificaciones Nuevas</p>
                        </div>
                    </div>

                    {/* ACTIVIDAD RECIENTE */}
                    <div className="graph-section">
                        <h3>Actividad Reciente</h3>
                        <ul style={{ listStyle: 'none', lineHeight: '35px', color: '#cbd5ff' }}>
                            <li><i className="fas fa-check-circle"></i> María entregó la Tarea 2 - Matemáticas</li>
                            <li><i className="fas fa-book"></i> Nuevo curso creado: Física Avanzada</li>
                            <li><i className="fas fa-user-plus"></i> Nuevo estudiante inscrito en Programación</li>
                            <li><i className="fas fa-edit"></i> Actualizaste la tarea "Proyecto Final"</li>
                        </ul>
                    </div>

                    <br/>

                    {/* PRÓXIMOS EVENTOS */}
                    <div className="graph-section">
                        <h3>Próximos Eventos</h3>
                        <ul style={{ listStyle: 'none', lineHeight: '35px', color: '#cbd5ff' }}>
                            <li><i className="fas fa-calendar"></i> 15 Feb - Entrega Proyecto Final</li>
                            <li><i className="fas fa-calendar"></i> 20 Feb - Examen Parcial</li>
                            <li><i className="fas fa-calendar"></i> 28 Feb - Cierre de Evaluaciones</li>
                        </ul>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Index;