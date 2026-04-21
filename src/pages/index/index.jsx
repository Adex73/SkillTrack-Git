import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';

function Index() {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({ nombre: 'Usuario', rol: 'Rol' });
    const [cursos, setCursos] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [entregas, setEntregas] = useState([]);

    // 🔥 FUNCION PRINCIPAL
    const cargarDatos = async (user) => {
        try {
            let url = "";

            if (user.rol === "profesor") {
                url = `/cursos/profesor/${user.id}`;
            } else {
                url = `/cursos/estudiante/${user.id}`;
            }

            const cursosRes = await fetch(url);
            const cursosData = await cursosRes.json();
            setCursos(cursosData);

            // 🔥 TRAER TODAS LAS TAREAS (OPTIMIZADO)
            const tareasPromises = cursosData.map(curso =>
                fetch(`/tareas/${curso._id}`)
                    .then(res => res.json())
            );

            const tareasArray = await Promise.all(tareasPromises);
            const todasTareas = tareasArray.flat();

            setTareas(todasTareas);

            // 🔥 ENTREGAS (solo estudiante)
            if (user.rol === "estudiante") {
                const res = await fetch(`/entregas/${user.id}`);
                const data = await res.json();
                setEntregas(data);
            }

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        }
    };

    // 🔥 CARGA INICIAL
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));

        if (!storedUser) {
            navigate("/");
        } else {
            setUsuario(storedUser);
            cargarDatos(storedUser);
        }
    }, [navigate]);

    // 🔥 LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className='index-page-wrapper'>
            <div className="dashboard-container">

                {/* SIDEBAR */}
                <div className="sidebar">
                    <div>
                        <div className="profile">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Perfil" />
                            <h3>{usuario.nombre}</h3>
                            <p style={{ color: '#cbd5ff', fontSize: '13px' }}>
                                {usuario.rol?.charAt(0).toUpperCase() + usuario.rol?.slice(1)}
                            </p>
                        </div>

                        <ul className="nav-links">
                            <li><Link to="/dashboard" className="active">🏠 Dashboard</Link></li>
                            <li><Link to="/mis-cursos">📚 Mis Cursos</Link></li>
                            {(usuario.rol === "administrador" || usuario.rol === "profesor") && (
                                <li>
                                    <Link to="/usuarios">
                                        <i className="fas fa-users"></i> Usuarios
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="logout">
                        <button onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                </div>

                {/* MAIN */}
                <div className="main-content">

                    <div className="topbar">
                        <h1>Bienvenido, {usuario.nombre} 👋</h1>
                    </div>

                    {/* CARDS */}
                    <div className="cards">
                        <div className="card">
                            <h2>{cursos?.length || 0}</h2>
                            <p>Cursos Activos</p>
                        </div>

                        <div className="card">
                            <h2>{tareas?.length || 0}</h2>
                            <p>Tareas</p>
                        </div>

                        <div className="card">
                            <h2>{entregas?.length || 0}</h2>
                            <p>Entregas</p>
                        </div>

                        <div className="card">
                            <h2>--</h2>
                            <p>Notificaciones</p>
                        </div>
                    </div>

                    {/* ACTIVIDAD */}
                    <div className="graph-section">
                        <h3>Actividad Reciente</h3>
                        <ul style={{ listStyle: 'none', lineHeight: '30px', color: '#cbd5ff' }}>
                            <li>✔ Datos actualizados correctamente</li>
                            <li>📚 Cursos cargados desde el servidor</li>
                            <li>📝 Tareas sincronizadas</li>
                        </ul>
                    </div>

                    <br />

                    {/* EVENTOS */}
                    <div className="graph-section">
                        <h3>Resumen</h3>
                        <ul style={{ listStyle: 'none', lineHeight: '30px', color: '#cbd5ff' }}>
                            <li>📊 Total cursos: {cursos.length}</li>
                            <li>📝 Total tareas: {tareas.length}</li>
                            <li>📂 Total entregas: {entregas.length}</li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Index;