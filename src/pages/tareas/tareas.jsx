import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './tareas.css';

function Tareas() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [cursoId, setCursoId] = useState(null);
    const [tareas, setTareas] = useState([]);
    const [tareasOriginales, setTareasOriginales] = useState([]);
    const [entregas, setEntregas] = useState([]);
    const [formVisible, setFormVisible] = useState(false);

    const [nuevaTarea, setNuevaTarea] = useState({
        titulo: '',
        descripcion: '',
        fecha: ''
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        const storedCursoId = localStorage.getItem("cursoId");

        if (!storedUser) {
            navigate("/");
            return;
        }

        setUsuario(storedUser);
        setCursoId(storedCursoId);
        cargarDatos(storedCursoId, storedUser);
    }, [navigate]);

    const cargarDatos = async (idCurso, user) => {
        try {
            const res = await fetch(`/tareas/${idCurso}`);
            const data = await res.json();

            setTareas(data);
            setTareasOriginales(data);

            if (user.rol === "estudiante") {
                const res2 = await fetch(`/entregas/${user.id}`);
                const data2 = await res2.json();
                setEntregas(data2);
            }
        } catch (error) {
            console.error("Error cargando tareas:", error);
        }
    };

    const crearTarea = async () => {
        if (!nuevaTarea.titulo || !nuevaTarea.descripcion || !nuevaTarea.fecha) {
            alert("Completa todos los campos");
            return;
        }

        try {
            await fetch("/tareas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cursoId,
                    titulo: nuevaTarea.titulo,
                    descripcion: nuevaTarea.descripcion,
                    fechaLimite: nuevaTarea.fecha,
                    usuarioId: usuario.id
                })
            });

            setFormVisible(false);
            setNuevaTarea({ titulo: '', descripcion: '', fecha: '' });
            cargarDatos(cursoId, usuario);
        } catch (error) {
            alert("Error al crear tarea");
        }
    };

    const subirArchivo = async (e, tareaId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("archivo", file);

        try {
            const upload = await fetch("/upload", { method: "POST", body: formData });
            const data = await upload.json();

            await fetch("/entregas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tareaId,
                    estudianteId: usuario.id,
                    archivo: data.url
                })
            });

            alert("✅ Tarea entregada");
            cargarDatos(cursoId, usuario);
        } catch (error) {
            alert("Error al subir archivo");
        }
    };
    
const filtrar = (tipo) => {
        const hoy = new Date();

        const filtradas = tareasOriginales.filter(t => {
            const entregada = entregas.find(
                e => String(e.tareaId) === String(t._id)
            );

            if (tipo === "entregado") return !!entregada;

            if (tipo === "vencida") {
                return !entregada && new Date(t.fechaLimite) < hoy;
            }

            if (tipo === "pendiente") {
                return !entregada && new Date(t.fechaLimite) >= hoy;
            }

            return true;
        });

        setTareas(filtradas);
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
                        <p>{usuario.rol}</p>
                    </div>

                    <ul className="nav-links">
                        <li><Link to="/mis-cursos">Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso">Contenido</Link></li>
                        <li><Link to="/tareas" className="active">Tareas</Link></li>
                    </ul>
                </div>

                <div className="logout">
                    <a href="#!" onClick={logout}>Cerrar Sesión</a>
                </div>
            </div>

            <div className="main-content">
                <div className="topbar">
                    <h1>Tareas del Curso</h1>

                    {usuario.rol === "profesor" && (
                        <button onClick={() => setFormVisible(true)}>
                            Nueva tarea
                        </button>
                    )}
                </div>

                {/* FILTROS */}
                <div className="filters">
                    <button onClick={() => filtrar("pendiente")}>Activas</button>
                    <button onClick={() => filtrar("entregado")}>Entregadas</button>
                    <button onClick={() => filtrar("vencida")}>Vencidas</button>
                </div>

                {/* FORM */}
                {formVisible && (
                    <div className="form-box">
                        <input
                            type="text"
                            placeholder="Título"
                            value={nuevaTarea.titulo}
                            onChange={e => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                        />

                        <textarea
                            placeholder="Descripción"
                            value={nuevaTarea.descripcion}
                            onChange={e => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                        />

                        <input
                            type="date"
                            value={nuevaTarea.fecha}
                            onChange={e => setNuevaTarea({ ...nuevaTarea, fecha: e.target.value })}
                        />

                        <button onClick={crearTarea}>Guardar</button>
                        <button onClick={() => setFormVisible(false)}>Cancelar</button>
                    </div>
                )}

                {/* LISTA */}
                <div className="tasks-container">
                    {tareas.length === 0 ? (
                        <p>No hay tareas</p>
                    ) : (
                        tareas.map(t => {
                            const hoy = new Date();

                            const entregada = entregas.find(
                                e => String(e.tareaId) === String(t._id)
                            );

                            let estado = "pendiente";

                            if (entregada) estado = "entregado";
                            else if (new Date(t.fechaLimite) < hoy) estado = "vencida";

                            return (
                                <div key={t._id} className={`task-card ${estado}`}>
                                    <h3>{t.titulo}</h3>
                                    <span>{estado}</span>

                                    <p>{t.descripcion}</p>

                                    {usuario.rol === "estudiante" && estado === "pendiente" && (
                                        <input type="file" onChange={e => subirArchivo(e, t._id)} />
                                    )}

                                    {estado === "entregado" && <p>✔ Entregado</p>}
                                    {estado === "vencida" && <p>❌ Cerrada</p>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Tareas;