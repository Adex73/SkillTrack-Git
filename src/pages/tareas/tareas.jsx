import React, { useState, useEffect, useCallback } from 'react';
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
    
    // Estado para nueva tarea
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
                body: JSON.stringify({ tareaId, estudianteId: usuario.id, archivo: data.url })
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
            const entregada = entregas.find(e => e.tareaId === t._id);
            if (tipo === 'entregado') return entregada;
            if (tipo === 'vencida') return !entregada && new Date(t.fechaLimite) < hoy;
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
                        <li><Link to="/mis-cursos"><i className="fas fa-arrow-left"></i> Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso"><i className="fas fa-stream"></i> Contenido</Link></li>
                        <li><Link to="/tareas" className="active"><i className="fas fa-tasks"></i> Tareas</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            <div className="main-content">
                <div className="topbar">
                    <h1><i className="fas fa-tasks"></i> Tareas del Curso</h1>
                    {usuario.rol === "profesor" && (
                        <button className="primary-btn" onClick={() => setFormVisible(true)}>
                            <i className="fas fa-plus"></i> Nueva tarea
                        </button>
                    )}
                </div>

                <div className="filters">
                    <button onClick={() => setTareas(tareasOriginales)}>Activas</button>
                    <button onClick={() => filtrar('entregado')}>Entregadas</button>
                    <button onClick={() => filtrar('vencida')}>Vencidas</button>
                </div>

                {formVisible && (
                    <div className="form-box">
                        <h3>Nueva tarea</h3>
                        <input type="text" placeholder="Título" value={nuevaTarea.titulo} 
                            onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} />
                        <textarea placeholder="Descripción" value={nuevaTarea.descripcion}
                            onChange={e => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})} />
                        <input type="date" value={nuevaTarea.fecha}
                            onChange={e => setNuevaTarea({...nuevaTarea, fecha: e.target.value})} />
                        <div className="form-actions">
                            <button className="primary-btn" onClick={crearTarea}>Guardar</button>
                            <button className="secondary-btn" onClick={() => setFormVisible(false)}>Cancelar</button>
                        </div>
                    </div>
                )}

                <div className="tasks-container">
                    {tareas.length === 0 ? (
                        <p style={{ color: '#cbd5ff' }}>No hay tareas disponibles.</p>
                    ) : (
                        tareas.map(t => {
                            const hoy = new Date();
                            const entregada = entregas.find(e => e.tareaId === t._id);
                            let estado = "pendiente";
                            if (entregada) estado = "entregado";
                            else if (new Date(t.fechaLimite) < hoy) estado = "vencida";

                            return (
                                <div key={t._id} className={`task-card ${estado}`}>
                                    <div className="task-header">
                                        <h3>{t.titulo}</h3>
                                        <span className={`status ${estado}`}>{estado.toUpperCase()}</span>
                                    </div>
                                    <div className="task-body">
                                        <p>{t.descripcion}</p>
                                        <p><i className="fas fa-calendar-alt"></i> {new Date(t.fechaLimite).toLocaleDateString()}</p>
                                    </div>
                                    <div className="task-footer">
                                        {usuario.rol === "estudiante" && estado === "pendiente" && (
                                            <input type="file" className="file-input" onChange={e => subirArchivo(e, t._id)} />
                                        )}
                                        {estado === "entregado" && (
                                            <button className="secondary-btn"><i className="fas fa-check"></i> Entregado</button>
                                        )}
                                        {estado === "vencida" && (
                                            <button className="disabled-btn"><i className="fas fa-lock"></i> Cerrada</button>
                                        )}
                                    </div>
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