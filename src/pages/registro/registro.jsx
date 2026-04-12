import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './registro.css'; 

function Registro() {
    const navigate = useNavigate();

    // Estados para el formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        matricula: '',
        telefono: '',
        password: '',
        universidad: '',
        carrera: '',
        rol: 'estudiante'
    });

    // Estados para datos externos
    const [universidades, setUniversidades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [userSession, setUserSession] = useState({ nombre: 'Usuario', rol: 'Rol' });

    // 1. Verificar sesión al cargar
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            navigate("/"); 
        } else {
            setUserSession(usuario);
        }

        // 2. Cargar universidades
        fetch("/universidades")
            .then(res => res.json())
            .then(data => setUniversidades(data))
            .catch(err => console.error("Error cargando universidades:", err));
    }, [navigate]);

    // 3. Cargar carreras cuando cambie la universidad
    const handleUniversidadChange = async (e) => {
        const uniId = e.target.value;
        setFormData({ ...formData, universidad: uniId, carrera: '' });

        if (!uniId) {
            setCarreras([]);
            return;
        }

        try {
            const response = await fetch(`/carreras/${uniId}`);
            const data = await response.json();
            setCarreras(data);
        } catch (error) {
            console.error("Error cargando carreras:", error);
        }
    };

    // 4. Manejar registro
    const handleRegistro = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error);
                return;
            }

            alert("Usuario registrado correctamente");
            setFormData({
                nombre: '', email: '', matricula: '', telefono: '',
                password: '', universidad: '', carrera: '', rol: 'estudiante'
            });
            setCarreras([]);
        } catch (error) {
            alert("Error conectando con el servidor");
        }
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className="registro-page-wrapper">
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
                            <li><Link to="/usuarios" className="active"><i className="fas fa-users"></i> Usuarios</Link></li>
                            <li><Link to="/universidades"><i className="fas fa-university"></i> Universidades</Link></li>
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
                        <h1>Gestión de Usuarios</h1>
                    </div>

                    {/* TARJETA FORMULARIO */}
                    <div className="user-card">

                        <h2>Registrar Nuevo Usuario</h2>

                        <form onSubmit={handleRegistro}>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Nombre Completo</label>
                                    <input type="text" required value={formData.nombre} 
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                                </div>

                                <div className="input-group">
                                    <label>Correo Universitario</label>
                                    <input type="email" required value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>

                                <div className="input-group">
                                    <label>Matrícula</label>
                                    <input type="text" value={formData.matricula}
                                        onChange={(e) => setFormData({...formData, matricula: e.target.value})} />
                                </div>

                                <div className="input-group">
                                    <label>Teléfono</label>
                                    <input type="text" value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                </div>

                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <input type="password" required value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>

                                <div className="input-group">
                                    <label>Universidad</label>
                                    <select required value={formData.universidad} onChange={handleUniversidadChange}>
                                        <option value="">Seleccione Universidad</option>
                                        {universidades.map(u => (
                                            <option key={u._id} value={u._id}>{u.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Carrera</label>
                                    <select required value={formData.carrera} disabled={carreras.length === 0}
                                        onChange={(e) => setFormData({...formData, carrera: e.target.value})}>
                                        <option value="">Seleccione Carrera</option>
                                        {carreras.map(c => (
                                            <option key={c._id} value={c._id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Rol</label>
                                    <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                                        <option value="estudiante">Estudiante</option>
                                        <option value="profesor">Profesor</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                </div>

                            </div>

                            <div className="button-container">
                                <button type="submit">
                                    <i className="fas fa-user-plus"></i> Registrar Usuario
                                </button>
                            </div>

                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Registro;