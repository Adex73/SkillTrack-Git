import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './datos-curso.css';

function DatosCurso() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [curso, setCurso] = useState(null);
    const [cursoId, setCursoId] = useState(null);
    const [contenidoGlobal, setContenidoGlobal] = useState(null);
    const [moduloAbierto, setModuloAbierto] = useState(null);
    const [temaSeleccionado, setTemaSeleccionado] = useState(null);
    const [editContenido, setEditContenido] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        const storedCurso = JSON.parse(localStorage.getItem("cursoSeleccionado"));
        const storedCursoId = localStorage.getItem("cursoId");

        if (!storedUser || !storedCursoId) {
            navigate("/");
            return;
        }

        setUsuario(storedUser);
        setCurso(storedCurso);
        setCursoId(storedCursoId);
        cargarEstructura(storedCursoId);
    }, [navigate]);

    const cargarEstructura = async (id) => {
        try {
            await fetch(`/contenido/${id}`, { method: "POST" });
            const res = await fetch(`/contenido/${id}`);
            const data = await res.json();
            setContenidoGlobal(data);
        } catch (error) {
            console.error("Error cargando estructura:", error);
        }
    };

    const toggleModulo = (index) => {
        setModuloAbierto(moduloAbierto === index ? null : index);
    };

    const abrirTema = (modIndex, temaIndex) => {
        const tema = contenidoGlobal.modulos[modIndex].temas[temaIndex];
        setTemaSeleccionado({ modIndex, temaIndex, ...tema });
        setEditContenido(tema.contenido || "");
    };

    const crearTema = async (index) => {
        const input = document.getElementById(`titulo-${index}`);
        const titulo = input.value.trim();

        if (!titulo) {
            alert("Escribe un título");
            return;
        }

        try {
            const res = await fetch(`/contenido/${cursoId}/modulo/${index}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo, contenido: "", tipo: "documento", archivo: "" })
            });

            if (res.ok) {
                input.value = "";
                setModuloAbierto(index);
                await cargarEstructura(cursoId);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    const guardarCambios = async () => {
        let archivoURL = temaSeleccionado.archivo;

        try {
            if (file) {
                const formData = new FormData();
                formData.append("archivo", file);
                const uploadRes = await fetch("/upload", { method: "POST", body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) archivoURL = uploadData.url;
            }

            const res = await fetch(`/contenido/${cursoId}/modulo/${temaSeleccionado.modIndex}/tema/${temaSeleccionado.temaIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contenido: editContenido, archivo: archivoURL })
            });

            if (res.ok) {
                alert("✅ Cambios guardados");
                setModuloAbierto(temaSeleccionado.modIndex);
                setTemaSeleccionado(null);
                setFile(null);
                await cargarEstructura(cursoId);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    const eliminarTema = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar este tema?")) return;
        try {
            const res = await fetch(`/contenido/${cursoId}/modulo/${temaSeleccionado.modIndex}/tema/${temaSeleccionado.temaIndex}`, { method: "DELETE" });
            if (res.ok) {
                alert("🗑️ Tema eliminado");
                setModuloAbierto(temaSeleccionado.modIndex);
                setTemaSeleccionado(null);
                await cargarEstructura(cursoId);
            }
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    if (!usuario || !contenidoGlobal) return null;

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
                        <li><Link to="/mis-cursos"><i className="fas fa-arrow-left"></i> Volver</Link></li>
                        <li><Link to="/mis-cursos/datos-curso" className="active"><i className="fas fa-stream"></i> Contenido</Link></li>
                        <li><Link to="/tareas"><i className="fas fa-tasks"></i> Tareas</Link></li>
                        <li><Link to="/calificaciones"><i className="fas fa-chart-bar"></i> Calificaciones</Link></li>
                        <li><Link to="/reportes"><i className="fas fa-chart-line"></i> Reportes</Link></li>
                        <li><Link to="/inscripciones"><i className="fas fa-user-plus"></i> Inscripciones</Link></li>
                    </ul>
                </div>
                <div className="logout">
                    <a href="#!" onClick={logout}><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                </div>
            </div>

            <div className="main-content">
                {temaSeleccionado ? (
                    <div className="tema-detalle">
                        <button onClick={() => setTemaSeleccionado(null)} className="btn-back">← Volver</button>
                        <h2>{temaSeleccionado.titulo}</h2>
                        <div className="tema-body">
                            <p>{temaSeleccionado.contenido || "Sin contenido..."}</p>
                            {temaSeleccionado.archivo && <a href={temaSeleccionado.archivo} target="_blank" rel="noreferrer">📄 Abrir documento</a>}
                        </div>
                        {usuario.rol === "profesor" && (
                            <div className="edit-tema">
                                <h4>Editar contenido</h4>
                                <textarea value={editContenido} onChange={(e) => setEditContenido(e.target.value)} placeholder="Escribe el contenido..." />
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                                <button onClick={guardarCambios}>💾 Guardar cambios</button>
                                <button className="btn-delete" onClick={eliminarTema}>🗑️ Eliminar tema</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="course-banner">
                            <div>
                                <h1>{curso?.nombre || "Curso"}</h1>
                                <p>{curso?.grupo} • {curso?.carreraId?.nombre || "Sin carrera"}</p>
                                <p>Profesor: {usuario.rol === 'profesor' ? usuario.nombre : curso?.profesorId?.nombre}</p>
                            </div>
                        </div>
                        <div className="course-content">
                            {contenidoGlobal.modulos.map((modulo, index) => (
                                <div className="module-card" key={index}>
                                    <div className="module-header" onClick={() => toggleModulo(index)}>
                                        <h3><i className="fas fa-folder-open"></i> {modulo.titulo}</h3>
            </div>
                                    {moduloAbierto === index && (
                                        <ul className="module-list">
                                            {modulo.temas.map((tema, i) => (
                                                <li key={i} onClick={() => abrirTema(index, i)}>
                                                    <i className="fas fa-file-alt"></i> {tema.titulo}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {usuario.rol === "profesor" && (
                                        <div className="add-tema">
                                            <input placeholder="Título del tema" id={`titulo-${index}`} />
                                            <button onClick={() => crearTema(index)}><i className="fas fa-plus"></i> Agregar</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DatosCurso;