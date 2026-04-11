import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './universidades.css';

function Universidades() {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState({ nombre: 'Usuario', rol: 'Rol' });
    const [universidades, setUniversidades] = useState([]);
    const [nombreUniversidad, setNombreUniversidad] = useState('');

    // 1. Validar sesión y cargar datos iniciales
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            navigate("/");
        } else {
            setUserSession(usuario);
            cargarUniversidades();
        }
    }, [navigate]);

    const cargarUniversidades = async () => {
        try {
            const res = await fetch("http://localhost:3000/universidades");
            const data = await res.json();
            setUniversidades(data);
        } catch (error) {
            console.error("Error cargando universidades:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/universidades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nombreUniversidad })
            });
            const data = await res.json();
            alert(data.mensaje || data.error);
            setNombreUniversidad('');
            cargarUniversidades();
        } catch (error) {
            alert("Error al registrar universidad");
        }
    };

    const eliminarUniversidad = async (id) => {
        if (!window.confirm("¿Eliminar universidad?")) return;
        try {
            await fetch(`http://localhost:3000/universidades/${id}`, {
                method: "DELETE"
            });
            cargarUniversidades();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

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
                        <img src="https://i.pravatar.cc/150?img=15" alt="Usuario" />
                        <h3 id="nombreUsuario">{userSession.nombre}</h3>
                        <p id="rolUsuario" style={{ color: '#cbd5ff', fontSize: '13px' }}>
                            {userSession.rol.charAt(0).toUpperCase() + userSession.rol.slice(1)}
                        </p>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/dashboard"><i className="fas fa-home"></i> Dashboard</Link></li>
                        <li><Link to="/usuarios"><i className="fas fa-users"></i> Usuarios</Link></li>
                        <li><Link to="/universidades" className="active"><i className="fas fa-university"></i> Universidades</Link></li>
                        <li><Link to="/carreras"><i className="fas fa-graduation-cap"></i> Carreras</Link></li>
                        <li><Link to="/cursos"><i className="fas fa-book"></i> Cursos</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Gestión de Universidades</h1>
                </div>

                <div className="content-grid">
                    {/* FORMULARIO */}
                    <div className="card-box">
                        <h2>Registrar Universidad</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Nombre de la Universidad</label>
                                <input 
                                    type="text" 
                                    value={nombreUniversidad} 
                                    onChange={(e) => setNombreUniversidad(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit">
                                <i className="fas fa-plus-circle"></i> Registrar Universidad
                            </button>
                        </form>
                    </div>

                    {/* LISTA */}
                    <div className="card-box">
                        <h2>Universidades Registradas</h2>
                        <ul className="lista">
                            {universidades.map(u => (
                                <li key={u._id}>
                                    {u.nombre}
                                    <button onClick={() => eliminarUniversidad(u._id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Universidades;