import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './carreras.css';

function Carreras() {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState({ nombre: 'Usuario', rol: 'Rol' });
    const [universidades, setUniversidades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [selectedUni, setSelectedUni] = useState('');
    const [nuevaCarrera, setNuevaCarrera] = useState('');

    // 1. Control de sesión y carga inicial de universidades
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            navigate("/");
        } else {
            setUserSession(usuario);
        }

        fetch("http://localhost:3000/universidades")
            .then(res => res.json())
            .then(data => setUniversidades(data))
            .catch(err => console.error("Error cargando universidades:", err));
    }, [navigate]);

    // 2. Cargar carreras cuando cambia la universidad seleccionada
    useEffect(() => {
        if (selectedUni) {
            cargarCarreras(selectedUni);
        } else {
            setCarreras([]);
        }
    }, [selectedUni]);

    const cargarCarreras = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/carreras/${id}`);
            const data = await res.json();
            setCarreras(data);
        } catch (error) {
            console.error("Error cargando carreras:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/carreras", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nuevaCarrera, universidadId: selectedUni })
            });
            const data = await res.json();
            alert(data.mensaje || data.error);
            setNuevaCarrera('');
            cargarCarreras(selectedUni);
        } catch (error) {
            alert("Error al registrar carrera");
        }
    };

    const eliminarCarrera = async (id) => {
        if (!window.confirm("¿Eliminar carrera?")) return;
        try {
            await fetch(`http://localhost:3000/carreras/${id}`, { method: "DELETE" });
            cargarCarreras(selectedUni);
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
                        <li><Link to="/universidades"><i className="fas fa-university"></i> Universidades</Link></li>
                        <li><Link to="/carreras" className="active"><i className="fas fa-graduation-cap"></i> Carreras</Link></li>
                        <li><Link to="/cursos"><i className="fas fa-book"></i> Cursos</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            {/* MAIN */}
            <div className="main-content">
                <div className="topbar">
                    <h1>Gestión de Carreras</h1>
                </div>

                <div className="content-grid">
                    {/* FORMULARIO */}
                    <div className="card-box">
                        <h2>Registrar Carrera</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Universidad</label>
                                <select value={selectedUni} onChange={(e) => setSelectedUni(e.target.value)} required>
                                    <option value="">Seleccione Universidad</option>
                                    {universidades.map(u => (
                                        <option key={u._id} value={u._id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Nombre de la Carrera</label>
                                <input type="text" value={nuevaCarrera} onChange={(e) => setNuevaCarrera(e.target.value)} required />
                            </div>
                            <button type="submit">
                                <i className="fas fa-plus-circle"></i> Registrar Carrera
                            </button>
                        </form>
                    </div>

                    {/* LISTA */}
                    <div className="card-box">
                        <h2>Carreras Registradas</h2>
                        <ul className="lista">
                            {carreras.length === 0 && <p style={{ color: '#cbd5ff' }}>Seleccione una universidad para ver sus carreras.</p>}
                            {carreras.map(c => (
                                <li key={c._id}>
                                    {c.nombre}
                                    <button onClick={() => eliminarCarrera(c._id)}>
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

export default Carreras;