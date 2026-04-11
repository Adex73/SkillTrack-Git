import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './mis-cursos.css';

function MisCursos() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        if (!storedUser) {
            navigate("/");
            return;
        }
        setUsuario(storedUser);
        cargarCursos(storedUser);
    }, [navigate]);

    const cargarCursos = async (user) => {
        try {
            let url = "";
            if (user.rol === "profesor") {
                url = `http://localhost:3000/cursos/profesor/${user.id}`;
            } else if (user.rol === "estudiante") {
                url = `http://localhost:3000/cursos/estudiante/${user.id}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setCursos(data);
        } catch (error) {
            console.error("Error al cargar cursos:", error);
        }
    };

    const verCurso = (curso) => {
        localStorage.setItem("cursoId", curso._id);
        localStorage.setItem("cursoSeleccionado", JSON.stringify(curso));
        navigate("/mis-cursos/datos-curso");
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    if (!usuario) return null;

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div>
                    <div className="profile">
                        <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" />
                        <h3>{usuario.nombre}</h3>
                        <p style={{ color: '#cbd5ff', fontSize: '13px' }}>
                            {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                        </p>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/dashboard"><i className="fas fa-home"></i> Dashboard</Link></li>
                        <li><Link to="/mis-cursos" className="active"><i className="fas fa-book"></i> Mis Cursos</Link></li>
                        <li><Link to="/usuarios"><i className="fas fa-users"></i> Usuarios</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            <div className="main-content">
                <div className="topbar">
                    <h1>Mis Cursos</h1>
                </div>
                <div className="courses-grid">
                    {cursos.length === 0 ? (
                        <p>No tienes cursos asignados.</p>
                    ) : (
                        cursos.map(curso => (
                            <div className="course-card" key={curso._id}>
                                <div className="course-header">
                                    <h3>{curso.nombre}</h3>
                                    <span className="grupo">{curso.grupo}</span>
                                </div>
                                <div className="course-body">
                                    <p><i className="fas fa-user"></i> Profesor: {curso.profesorId?.nombre || "N/A"}</p>
                                    <p><i className="fas fa-graduation-cap"></i> {curso.carreraId?.nombre || "Sin carrera"}</p>
                                </div>
                                <div className="course-footer">
                                    <button className="btn-ver-curso" onClick={() => verCurso(curso)}>
                                        <i className="fas fa-eye"></i> Ver Curso
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MisCursos;