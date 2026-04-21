const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Asegurar que la carpeta de subidas existe para evitar errores en multer
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}


// CONEXIÓN A MONGODB
mongoose.connect("mongodb://localhost:27017/skilltrack")
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.log("❌ Error de conexión:", err));


// =======================
// MODELOS
// =======================

//CARGAR ACRCHIVOS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

// USUARIO
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: { type: String, unique: true },
    matricula: String,
    telefono: String,
    universidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Universidad"
    },
    carrera: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carrera"
    },
    rol: {
        type: String,
        enum: ["estudiante", "profesor", "administrador"],
        default: "estudiante"
    },
    password: {
        type: String,
        required: true
    }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// UNIVERSIDAD
const UniversidadSchema = new mongoose.Schema({
    nombre: String
});

const Universidad = mongoose.model("Universidad", UniversidadSchema);

// CARRERA
const CarreraSchema = new mongoose.Schema({
    nombre: String,
    universidadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Universidad"
    }
});

const Carrera = mongoose.model("Carrera", CarreraSchema);

//CURSOS
const CursoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    grupo: { type: String, required: true },

    carreraId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carrera",
        required: true
    },

    universidadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Universidad",
        required: true
    },

    profesorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    semestre: { type: String, required: true },

    activo: { type: Boolean, default: true }
});

const Curso = mongoose.model("Curso", CursoSchema);

//TEMAS DE CURSOS
const CursoContenidoSchema = new mongoose.Schema({
    cursoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curso",
        required: true
    },

    modulos: [
        {
            titulo: String, // "Módulo 1"
            temas: [
                {
                    titulo: String,
                    contenido: String,
                    tipo: String, // "documento", "video", "link"
                    archivo: String, // URL o texto
                    fecha: { type: Date, default: Date.now }
                }
            ]
        }
    ]
});

const CursoContenido = mongoose.model("CursoContenido", CursoContenidoSchema);

//INSCRIPCIONES
const InscripcionSchema = new mongoose.Schema({
    cursoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curso",
        required: true
    },
    estudianteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    }
});

const Inscripcion = mongoose.model("Inscripcion", InscripcionSchema);

//TAREAS DEL CURSO
const TareaSchema = new mongoose.Schema({
    cursoId: { type: mongoose.Schema.Types.ObjectId, ref: "Curso" },
    titulo: String,
    descripcion: String,
    fechaLimite: Date,
    creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }
});

const Tarea = mongoose.model("Tarea", TareaSchema);

// ENTREGAS DE TAREAS
const EntregaSchema = new mongoose.Schema({
    tareaId: { type: mongoose.Schema.Types.ObjectId, ref: "Tarea" },
    estudianteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    archivo: String,
    fechaEntrega: { type: Date, default: Date.now }
});

const Entrega = mongoose.model("Entrega", EntregaSchema);
// ==========================================================================================================================================
// RUTAS
// ==========================================================================================================================================

//SUBIR ARCHIVOS
app.post("/upload", upload.single("archivo"), (req, res) => {
    try {
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        res.json({
            mensaje: "Archivo subido",
            url: fileUrl
        });

    } catch (error) {
        res.status(500).json({ error: "Error al subir archivo" });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email }).populate("carrera", "nombre");

        if (!usuario) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const esValido = await bcrypt.compare(password, usuario.password);

        if (!esValido) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        res.json({
            mensaje: "Login exitoso",
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                universidad: usuario.universidad
}
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});


// REGISTRO USUARIOS
app.post("/registro", async (req, res) => {
    try {
        const {
            nombre,
            email,
            matricula,
            telefono,
            universidad,
            carrera,
            rol,
            password
        } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const existeUsuario = await Usuario.findOne({ email });

        if (existeUsuario) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const passwordEncriptado = await bcrypt.hash(password, 10);

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            matricula,
            telefono,
            universidad,
            carrera,
            rol,
            password: passwordEncriptado
        });

        await nuevoUsuario.save();

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        console.log("ERROR REGISTRO:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


// REGISTRAR UNIVERSIDAD
app.post("/universidades", async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const existe = await Universidad.findOne({ nombre });
        if (existe) {
            return res.status(400).json({ error: "La universidad ya existe" });
        }

        const nueva = new Universidad({ nombre });
        await nueva.save();

        res.json({ mensaje: "Universidad registrada correctamente" });

    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
});


// OBTENER UNIVERSIDADES
app.get("/universidades", async (req, res) => {
    const universidades = await Universidad.find();
    res.json(universidades);
});


// ELIMINAR UNIVERSIDAD
app.delete("/universidades/:id", async (req, res) => {
    try {
        await Universidad.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Universidad eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});


// REGISTRAR CARRERA
app.post("/carreras", async (req, res) => {
    try {
        const { nombre, universidadId } = req.body;

        if (!nombre || !universidadId) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const existe = await Carrera.findOne({ nombre, universidadId });

        if (existe) {
            return res.status(400).json({ error: "La carrera ya existe en esta universidad" });
        }

        const nuevaCarrera = new Carrera({ nombre, universidadId });

        await nuevaCarrera.save();

        res.json({ mensaje: "Carrera registrada correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
});


// OBTENER CARRERAS (por universidad)
app.get("/carreras/:universidadId", async (req, res) => {
    const carreras = await Carrera.find({
        universidadId: req.params.universidadId
    });
    res.json(carreras);
});


// OBTENER TODAS LAS CARRERAS
app.get("/carreras", async (req, res) => {
    const carreras = await Carrera.find();
    res.json(carreras);
});


// ELIMINAR CARRERA
app.delete("/carreras/:id", async (req, res) => {
    try {
        await Carrera.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Carrera eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});


// OBTENER PROFESORES
app.get("/profesores", async (req, res) => {
    const profesores = await Usuario.find({ rol: "profesor" });
    res.json(profesores);
});

//REGISTRAR CURSOS
app.post("/cursos", async (req, res) => {
    try {
        const { nombre, grupo, carreraId, universidadId, profesorId, semestre, activo } = req.body;

        if (!nombre || !grupo || !carreraId || !universidadId || !profesorId || !semestre) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const nuevoCurso = new Curso({
            nombre,
            grupo,
            carreraId,
            universidadId,
            profesorId,
            semestre,
            activo
        });

        await nuevoCurso.save();

        res.json({ mensaje: "Curso registrado correctamente" });

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

//OBTENER CURSOS:
app.get("/cursos", async (req, res) => {
    const cursos = await Curso.find()
        .populate("profesorId", "nombre")
        .populate("carreraId", "nombre")
        .populate("universidadId", "nombre");

    res.json(cursos);
});

// OBTENER CURSOS POR PROFESOR
app.get("/cursos/profesor/:id", async (req, res) => {
    try {
        console.log("ID recibido:", req.params.id);

        const profesorId = new mongoose.Types.ObjectId(req.params.id);

        const cursos = await Curso.find({ profesorId: profesorId })
            .populate("carreraId", "nombre")
            .populate("universidadId", "nombre");

        console.log("Cursos encontrados:", cursos);

        res.json(cursos);
    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ error: "Error al obtener cursos del profesor" });
    }
});

//ELIMINAR CURSOS
app.delete("/cursos/:id", async (req, res) => {
    try {
        await Curso.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Curso eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

//CREAR CONTENIDOS DE CURSO
app.post("/contenido/:cursoId", async (req, res) => {
    try {
        const existe = await CursoContenido.findOne({ cursoId: req.params.cursoId });

        if (existe) {
            return res.json(existe);
        }

        const nuevo = new CursoContenido({
            cursoId: req.params.cursoId,
            modulos: [
                { titulo: "Módulo 1", temas: [] },
                { titulo: "Módulo 2", temas: [] },
                { titulo: "Módulo 3", temas: [] }
            ]
        });

        await nuevo.save();
        res.json(nuevo);

    } catch (error) {
        res.status(500).json({ error: "Error creando contenido" });
    }
});

//OBTENER CONTENIDOS DEL CURSO
app.get("/contenido/:cursoId", async (req, res) => {
    try {
        const contenido = await CursoContenido.findOne({ cursoId: req.params.cursoId });

        if (!contenido) {
            return res.status(404).json({ error: "No existe contenido" });
        }

        res.json(contenido);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener contenido" });
    }
});

//AGREGAR TEMAS AL CURSO
app.post("/contenido/:cursoId/modulo/:index", async (req, res) => {
    try {
        const { titulo, contenido, tipo, archivo } = req.body;

        const data = await CursoContenido.findOne({ cursoId: req.params.cursoId });

        if (!data) {
            return res.status(404).json({ error: "Contenido no encontrado" });
        }

        const index = parseInt(req.params.index);

        if (!data.modulos[index]) {
            return res.status(400).json({ error: "Módulo inválido" });
        }

        data.modulos[index].temas.push({
            titulo,
            contenido,
            tipo,
            archivo
        });

        await data.save();

        res.json({ mensaje: "Tema agregado correctamente" });

    } catch (error) {
        console.error("ERROR AL AGREGAR TEMA:", error);
        res.status(500).json({ error: "Error al agregar tema" });
    }
});

//EDITAR TEMA
app.put("/contenido/:cursoId/modulo/:modIndex/tema/:temaIndex", async (req, res) => {
    try {

        const { contenido, archivo } = req.body;

        const data = await CursoContenido.findOne({ cursoId: req.params.cursoId });

        if (!data) {
            return res.status(404).json({ error: "Contenido no encontrado" });
        }

        const modIndex = parseInt(req.params.modIndex);
        const temaIndex = parseInt(req.params.temaIndex);

        if (!data.modulos[modIndex]) {
            return res.status(400).json({ error: "Módulo inválido" });
        }

        if (!data.modulos[modIndex].temas[temaIndex]) {
            return res.status(400).json({ error: "Tema inválido" });
        }

        const tema = data.modulos[modIndex].temas[temaIndex];

        // 🔥 SOLO ACTUALIZA SI VIENE INFO
        if (contenido !== undefined) {
            tema.contenido = contenido;
        }

        if (archivo !== null && archivo !== undefined && archivo !== "") {
            tema.archivo = archivo;
        }

        await data.save();

        res.json({ mensaje: "Tema actualizado correctamente" });

    } catch (error) {
        console.error("ERROR AL ACTUALIZAR:", error);
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// ELIMINAR TEMA
app.delete("/contenido/:cursoId/modulo/:modIndex/tema/:temaIndex", async (req, res) => {
    try {

        const data = await CursoContenido.findOne({ cursoId: req.params.cursoId });

        if (!data) {
            return res.status(404).json({ error: "Contenido no encontrado" });
        }

        const modIndex = parseInt(req.params.modIndex);
        const temaIndex = parseInt(req.params.temaIndex);

        if (!data.modulos[modIndex]) {
            return res.status(400).json({ error: "Módulo inválido" });
        }

        if (!data.modulos[modIndex].temas[temaIndex]) {
            return res.status(400).json({ error: "Tema inválido" });
        }

        // 🔥 ELIMINAR
        data.modulos[modIndex].temas.splice(temaIndex, 1);

        await data.save();

        res.json({ mensaje: "Tema eliminado correctamente" });

    } catch (error) {
        console.error("ERROR AL ELIMINAR:", error);
        res.status(500).json({ error: "Error al eliminar tema" });
    }
});

//INSCRIBIR ALUMNOS A CURSO
app.post("/inscripciones", async (req, res) => {
    try {

        const { cursoId, estudianteId } = req.body;

        // Validar duplicados
        const existe = await Inscripcion.findOne({ cursoId, estudianteId });

        if (existe) {
            return res.status(400).json({ error: "El alumno ya está inscrito" });
        }

        const nueva = new Inscripcion({
            cursoId,
            estudianteId
        });

        await nueva.save();

        res.json({ mensaje: "Alumno inscrito correctamente" });

    } catch (error) {
        console.error("ERROR INSCRIPCIÓN:", error);
        res.status(500).json({ error: "Error al inscribir" });
    }
});

//OBTENER ALUMNOS YA INSCRITOS
app.get("/inscripciones/:cursoId", async (req, res) => {
    try {
        const inscripciones = await Inscripcion.find({
            cursoId: req.params.cursoId
        });

        res.json(inscripciones);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener inscripciones" });
    }
});

//DESINSCRIBIR ALUMNOS
app.delete("/inscripciones", async (req, res) => {
    try {
        const { cursoId, estudianteId } = req.body;

        await Inscripcion.findOneAndDelete({ cursoId, estudianteId });

        res.json({ mensaje: "Alumno desinscrito correctamente" });

    } catch (error) {
        res.status(500).json({ error: "Error al desinscribir" });
    }
});

//BUSCAR ESTUDIANTES
app.get("/estudiantes/buscar", async (req, res) => {
    try {

        const { texto, universidad } = req.query;

        const estudiantes = await Usuario.find({
            rol: "estudiante",
            universidad: universidad,
            $or: [
                { nombre: { $regex: texto, $options: "i" } },
                { matricula: { $regex: texto, $options: "i" } }
            ]
        });

        res.json(estudiantes);

    } catch (error) {
        res.status(500).json({ error: "Error al buscar estudiantes" });
    }
});

// OBTENER CURSOS DE UN ESTUDIANTE
app.get("/cursos/estudiante/:id", async (req, res) => {
    try {
        const estudianteId = new mongoose.Types.ObjectId(req.params.id);

        // Buscar inscripciones del alumno
        const inscripciones = await Inscripcion.find({ estudianteId });

        console.log("Inscripciones encontradas:", inscripciones);

        const cursosIds = inscripciones.map(i => i.cursoId);

        const cursos = await Curso.find({
            _id: { $in: cursosIds }
        })
        .populate("profesorId", "nombre")
        .populate("carreraId", "nombre")
        .populate("universidadId", "nombre");

        console.log("Cursos encontrados:", cursos);

        res.json(cursos);

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: "Error al obtener cursos del estudiante" });
    }
});

// CREAR TAREA (PROFESOR)
app.post("/tareas", async (req, res) => {
    try {
        const { cursoId, titulo, descripcion, fechaLimite, usuarioId } = req.body;

        const nueva = new Tarea({
            cursoId,
            titulo,
            descripcion,
            fechaLimite,
            creadaPor: usuarioId
        });

        await nueva.save();

        res.json({ mensaje: "Tarea creada correctamente" });

    } catch (error) {
        res.status(500).json({ error: "Error al crear tarea" });
    }
});

// OBTENER TAREAS DEL CURSO
app.get("/tareas/:cursoId", async (req, res) => {
    try {

        const cursoId = new mongoose.Types.ObjectId(req.params.cursoId);

        const tareas = await Tarea.find({ cursoId });

        res.json(tareas);

    } catch (error) {
        console.error("ERROR AL OBTENER TAREAS:", error);
        res.status(500).json({ error: "Error al obtener tareas" });
    }
});

// ENTREGAR TAREA
app.post("/entregas", async (req, res) => {
    try {
        const { tareaId, estudianteId, archivo } = req.body;

        const existe = await Entrega.findOne({ tareaId, estudianteId });

        if (existe) {
            return res.status(400).json({ error: "Ya entregaste esta tarea" });
        }

        const nueva = new Entrega({
            tareaId,
            estudianteId,
            archivo
        });

        await nueva.save();

        res.json({ mensaje: "Tarea entregada correctamente" });

    } catch (error) {
        res.status(500).json({ error: "Error al entregar tarea" });
    }
});

// OBTENER ENTREGAS DEL ALUMNO
app.get("/entregas/:estudianteId", async (req, res) => {
    try {
        const entregas = await Entrega.find({
            estudianteId: req.params.estudianteId
        });

        res.json(entregas);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener entregas" });
    }
});




// Servir frontend
app.use(express.static(path.join(__dirname, "../build")));

// Rutas de la API van aquí...

// Manejar cualquier otra ruta devolviendo el index.html de React (para que React Router funcione)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// =======================
// INICIAR SERVIDOR
// =======================
app.listen(5000, () => {
    console.log("🔥 Servidor corriendo en http://localhost:5000");
});