import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './calificaciones.css';

function Calificaciones() {

    const navigate = useNavigate();

    const [userSession, setUserSession] = useState(null);

    const [promedio, setPromedio] = useState(0);

    const [calificaciones, setCalificaciones] = useState([]);

    const [alumnos, setAlumnos] = useState([]);

    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

    const [panelAlumno, setPanelAlumno] = useState({
        tareas: [],
        promedio: 0
    });

    const cursoSeleccionado = JSON.parse(
        localStorage.getItem("cursoSeleccionado")
    );

    useEffect(() => {

        const usuario = JSON.parse(
            localStorage.getItem("usuario")
        );

        if (!usuario) {
            navigate("/");
            return;
        }

        setUserSession(usuario);

        if (usuario.rol === "estudiante") {
            obtenerCalificacionesAlumno(usuario.id);
        }

        if (usuario.rol === "profesor") {
            obtenerResumenProfesor();
        }

    }, []);

    // =========================
    // ALUMNO
    // =========================

    const obtenerCalificacionesAlumno = async (usuarioId) => {

        try {

            const response = await fetch(
                `http://localhost:5000/calificaciones/alumno/${usuarioId}/${cursoSeleccionado._id}`
            );

            const data = await response.json();

            setCalificaciones(data);

            if (data.length > 0) {

                const suma = data.reduce(
                    (acc, item) => acc + item.calificacion,
                    0
                );

                setPromedio(
                    (suma / data.length).toFixed(1)
                );
            }

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // PROFESOR
    // =========================

    const obtenerResumenProfesor = async () => {

        try {

            const response = await fetch(
                `http://localhost:5000/calificaciones/profesor-resumen/${cursoSeleccionado._id}`
            );

            const data = await response.json();

            setAlumnos(data);

        } catch (error) {
            console.error(error);
        }
    };

    const seleccionarAlumno = async (alumno) => {

        setAlumnoSeleccionado(alumno);

        try {

            const response = await fetch(
                `http://localhost:5000/calificaciones/profesor/${cursoSeleccionado._id}/${alumno._id}`
            );

            const data = await response.json();

            setPanelAlumno(data);

        } catch (error) {
            console.error(error);
        }
    };

    const guardarCalificacion = async (
        tareaId,
        estudianteId,
        calificacion,
        comentario
    ) => {

        try {

            await fetch(
                "http://localhost:5000/calificaciones",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        tareaId,
                        estudianteId,
                        profesorId: userSession.id,
                        calificacion,
                        comentario
                    })
                }
            );

            alert("Calificación guardada");

            seleccionarAlumno(alumnoSeleccionado);

            obtenerResumenProfesor();

        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    if (!userSession) return null;

    return (

        <div className="dashboard-container">

            {/* SIDEBAR */}

            <div className="sidebar">

                <div>

                    <div className="profile">

                        <img
                            src="https://i.pravatar.cc/150?img=12"
                            alt="Perfil"
                        />

                        <h3>{userSession.nombre}</h3>

                        <p
                            style={{
                                color: '#cbd5ff',
                                fontSize: '13px'
                            }}
                        >
                            {userSession.rol}
                        </p>

                    </div>

                    <ul className="nav-links">

                        <li>
                            <Link to="/mis-cursos">
                                <i className="fas fa-arrow-left"></i>
                                Volver
                            </Link>
                        </li>

                        <li>
                            <Link to="/mis-cursos/datos-curso">
                                <i className="fas fa-stream"></i>
                                Contenido
                            </Link>
                        </li>

                        <li>
                            <Link to="/tareas">
                                <i className="fas fa-tasks"></i>
                                Tareas
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/calificaciones"
                                className="active"
                            >
                                <i className="fas fa-chart-bar"></i>
                                Calificaciones
                            </Link>
                        </li>

                        <li>
                            <Link to="/reportes">
                                <i className="fas fa-chart-line"></i>
                                Reportes
                            </Link>
                        </li>

                     <li><Link to="/inscripciones"><i className="fas fa-user-plus"></i> Inscripciones</Link></li>
                    </ul>

                </div>

                <div className="logout">

                    <a href="#!" onClick={logout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Cerrar Sesión
                    </a>

                </div>

            </div>

            {/* MAIN */}

            <div className="main-content">

                <div className="topbar">
                    <h1>Calificaciones</h1>
                </div>

                {/* ======================== */}
                {/* ALUMNO */}
                {/* ======================== */}

                {userSession.rol === "estudiante" && (

                    <>

                        <div className="summary-card">

                            <h2>Promedio General</h2>

                            <div className="average-score">
                                {promedio}
                            </div>

                        </div>

                        <div className="grades-table-container">

                            <table className="grades-table">

                                <thead>
                                    <tr>
                                        <th>Tarea</th>
                                        <th>Calificación</th>
                                        <th>Comentario</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {calificaciones.map((item) => (

                                        <tr key={item._id}>

                                            <td>
                                                {item.tareaId?.titulo}
                                            </td>

                                            <td className={
                                                item.calificacion >= 90
                                                ? "grade high"
                                                : item.calificacion >= 70
                                                ? "grade medium"
                                                : "grade low"
                                            }>
                                                {item.calificacion}
                                            </td>

                                            <td>
                                                {item.comentario || "Sin comentario"}
                                            </td>

                                            <td>
                                                {
                                                    new Date(item.fecha)
                                                    .toLocaleDateString()
                                                }
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </>
                )}

                {/* ======================== */}
                {/* PROFESOR */}
                {/* ======================== */}

                {userSession.rol === "profesor" && (

                    <div className="profesor-layout">

                        {/* LISTA ALUMNOS */}

                        <div className="students-list">

                            <h2>Alumnos</h2>

                            {alumnos.map((item) => (

                                <div
                                    key={item.alumno._id}
                                    className={`student-item ${
                                        alumnoSeleccionado?._id === item.alumno._id
                                        ? "selected-student"
                                        : ""
                                    }`}
                                    onClick={() =>
                                        seleccionarAlumno(item.alumno)
                                    }
                                >

                                    <h3>{item.alumno.nombre}</h3>

                                    <p>
                                        Promedio: {item.promedio}
                                    </p>

                                </div>

                            ))}

                        </div>

                        {/* PANEL ALUMNO */}

                        <div className="student-details">

                            {!alumnoSeleccionado ? (

                                <div className="empty-state">
                                    Selecciona un alumno
                                </div>

                            ) : (

                                <>

                                    <div className="summary-card">

                                        <h2>
                                            {alumnoSeleccionado.nombre}
                                        </h2>

                                        <div className="average-score">
                                            {panelAlumno.promedio}
                                        </div>

                                    </div>

                                    <div className="grades-table-container">

                                        <table className="grades-table">

                                            <thead>

                                                <tr>
                                                    <th>Tarea</th>
                                                    <th>Estado</th>
                                                    <th>Archivo</th>
                                                    <th>Calificación</th>
                                                    <th>Comentario</th>
                                                    <th>Guardar</th>
                                                </tr>

                                            </thead>

                                            <tbody>

                                                {panelAlumno.tareas.map((tarea) => (

                                                    <tr key={tarea.tareaId}>

                                                        <td>
                                                            {tarea.titulo}
                                                        </td>

                                                        <td>

                                                            <span className={
                                                                tarea.estado === "Entregada"
                                                                ? "status entregada"
                                                                : tarea.estado === "Vencida"
                                                                ? "status vencida"
                                                                : "status pendiente"
                                                            }>
                                                                {tarea.estado}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            {tarea.entrega?.archivo ? (

                                                                <a
                                                                    href={tarea.entrega.archivo}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="archivo-link"
                                                                >
                                                                    Ver archivo
                                                                </a>

                                                            ) : (
                                                                "Sin entrega"
                                                            )}

                                                        </td>

                                                        <td>

                                                            <input
                                                                type="number"
                                                                defaultValue={
                                                                    tarea.calificacion?.calificacion || ""
                                                                }
                                                                id={`cal-${tarea.tareaId}`}
                                                            />

                                                        </td>

                                                        <td>

                                                            <input
                                                                type="text"
                                                                defaultValue={
                                                                    tarea.calificacion?.comentario || ""
                                                                }
                                                                id={`com-${tarea.tareaId}`}
                                                            />

                                                        </td>

                                                        <td>

                                                            <button
                                                                onClick={() => {

                                                                    const calificacion =
                                                                        document.getElementById(
                                                                            `cal-${tarea.tareaId}`
                                                                        ).value;

                                                                    const comentario =
                                                                        document.getElementById(
                                                                            `com-${tarea.tareaId}`
                                                                        ).value;

                                                                    guardarCalificacion(
                                                                        tarea.tareaId,
                                                                        alumnoSeleccionado._id,
                                                                        calificacion,
                                                                        comentario
                                                                    );
                                                                }}
                                                            >
                                                                Guardar
                                                            </button>

                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>

    );
}

export default Calificaciones;