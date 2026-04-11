import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './cursos.css';

function Cursos() {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState({ nombre: 'Usuario', rol: 'Rol' });
    
    // Listas para los selects y la tabla
    const [profesores, setProfesores] = useState([]);
    const [universidades, setUniversidades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [cursos, setCursos] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        grupo: '',
        carreraId: '',
        universidadId: '',
        profesorId: '',
        semestre: '',
        activo: true
    });

    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            navigate("/");
        } else {
            setUserSession(usuario);
        }

        cargarDatosIniciales();
    }, [navigate]);

    const cargarDatosIniciales = async () => {
        try {
            const [profRes, uniRes, carRes, curRes] = await Promise.all([
                fetch("http://localhost:3000/profesores"),
                fetch("http://localhost:3000/universidades"),
                fetch("http://localhost:3000/carreras"),
                fetch("http://localhost:3000/cursos")
            ]);

            setProfesores(await profRes.json());
            setUniversidades(await uniRes.json());
            setCarreras(await carRes.json());
            setCursos(await curRes.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: id === 'activo' ? value === 'true' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nombre || !formData.grupo || !formData.carreraId || !formData.universidadId || !formData.profesorId || !formData.semestre) {
            alert("Todos los campos son obligatorios");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/cursos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            alert(result.mensaje || result.error);

            if (res.ok) {
                setFormData({
                    nombre: '', grupo: '', carreraId: '', universidadId: '', profesorId: '', semestre: '', activo: true
                });
                const curRes = await fetch("http://localhost:3000/cursos");
                setCursos(await curRes.json());
            }
        } catch (error) {
            alert("Error conectando con el servidor");
        }
    };

    const eliminarCurso = async (id) => {
        if (!window.confirm("¿Eliminar curso?")) return;

        try {
            const res = await fetch(`http://localhost:3000/cursos/${id}`, { method: "DELETE" });
            if (res.ok) {
                const curRes = await fetch("http://localhost:3000/cursos");
                setCursos(await curRes.json());
            }
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
            <div className="sidebar">
                <div>
                    <div className="profile">
                        <img src="https://i.pravatar.cc/150?img=15" alt="Perfil" />
                        <h3>{userSession.nombre}</h3>
                        <p style={{ color: '#cbd5ff', fontSize: '13px' }}>
                            {userSession.rol.charAt(0).toUpperCase() + userSession.rol.slice(1)}
                        </p>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/dashboard"><i className="fas fa-home"></i> Dashboard</Link></li>
                        <li><Link to="/usuarios"><i className="fas fa-users"></i> Usuarios</Link></li>
                        <li><Link to="/universidades"><i className="fas fa-university"></i> Universidades</Link></li>
                        <li><Link to="/carreras"><i className="fas fa-graduation-cap"></i> Carreras</Link></li>
                        <li><Link to="/cursos" className="active"><i className="fas fa-book"></i> Cursos</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            <div className="main-content">
                <div className="topbar">
                    <h1>Gestión de Cursos</h1>
                </div>

                <div className="content-grid">
                    <div className="card-box">
                        <h2>Registrar Curso</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Materia</label>
                                <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <label>Profesor</label>
                                <select id="profesorId" value={formData.profesorId} onChange={handleInputChange} required>
                                    <option value="">Selecciona un profesor</option>
                                    {profesores.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Grupo</label>
                                <input type="text" id="grupo" value={formData.grupo} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <label>Carrera</label>
                                <select id="carreraId" value={formData.carreraId} onChange={handleInputChange} required>
                                    <option value="">Selecciona una carrera</option>
                                    {carreras.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Semestre</label>
                                <select id="semestre" value={formData.semestre} onChange={handleInputChange} required>
                                    <option value="">Selecciona semestre</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Universidad</label>
                                <select id="universidadId" value={formData.universidadId} onChange={handleInputChange} required>
                                    <option value="">Selecciona una universidad</option>
                                    {universidades.map(u => <option key={u._id} value={u._id}>{u.nombre}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Activo</label>
                                <select id="activo" value={formData.activo} onChange={handleInputChange}>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                            <button type="submit">
                                <i className="fas fa-plus-circle"></i> Registrar Curso
                            </button>
                        </form>
                    </div>

                    <div className="card-box">
                        <h2>Cursos Registrados</h2>
                        <ul className="lista">
                            {cursos.length === 0 && <p style={{ color: '#cbd5ff' }}>No hay cursos registrados.</p>}
                            {cursos.map(c => (
                                <li key={c._id}>
                                    <div>
                                        <strong>{c.nombre}</strong><br />
                                        {c.carreraId?.nombre || "Sin carrera"} - {c.universidadId?.nombre || "Sin universidad"}<br />
                                        Grupo {c.grupo} | Semestre {c.semestre}<br />
                                        Prof: {c.profesorId?.nombre || "Sin profesor"}<br />
                                        Estado: {c.activo ? "Activo" : "Inactivo"}
                                    </div>
                                    <button onClick={() => eliminarCurso(c._id)}>
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

export default Cursos;