// Este archivo yo lo cree. No forma parte por defecto de node.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// Middlewares............................................................................................................
app.use(cors());
app.use(express.json());

const path = require("path");

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login/login.html"));
});

// CONEXIÓN A MONGODB.........................................................................................................
mongoose.connect("mongodb://localhost:27017/skilltrack")
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.log("❌ Error de conexión:", err));


// MODELO DE USUARIO..........................................................................................................
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

// MODELO UNIVERSIDAD..........................................................................................................
const UniversidadSchema = new mongoose.Schema({
    nombre: String
});

const Universidad = mongoose.model("Universidad", UniversidadSchema);


// MODELO CARRERA................................................................................................................
const CarreraSchema = new mongoose.Schema({
    nombre: String,
    universidadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Universidad"
    }
});

const Carrera = mongoose.model("Carrera", CarreraSchema);

// MODELO CURSO...................................................................................................................  
const CursoSchema = new mongoose.Schema({
    nombreMateria: { type: String, required: true },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    grupo: { type: String, required: true },
    carrera: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carrera",
        required: true
    }
});

const Curso = mongoose.model("Curso", CursoSchema);

// RUTA LOGIN............................................................................................................
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });

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
        rol: usuario.rol
    }
});

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

//REGISTRO USUARIOS................................................................................................................
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

        if (!nombre || !email || !password || !universidad || !carrera) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const existeUsuario = await Usuario.findOne({ email });

        if (existeUsuario) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        //ENCRIPTACIÓN
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

//REGISTRAR UNIVERSIDAD.................................................................................................................
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

// REGISTRAR CARRERA..................................................................................................
app.post("/carreras", async (req, res) => {
    try {
        const { nombre, universidadId } = req.body;

        if (!nombre || !universidadId) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const existe = await Carrera.findOne({
            nombre,
            universidadId
        });

        if (existe) {
            return res.status(400).json({ error: "La carrera ya existe en esta universidad" });
        }

        const nuevaCarrera = new Carrera({
            nombre,
            universidadId
        });

        await nuevaCarrera.save();

        res.json({ mensaje: "Carrera registrada correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// REGISTRAR CURSO..................................................................................................
app.post("/cursos", async (req, res) => {
    try {
        const { nombreMateria, profesor, grupo, carrera } = req.body;

        if (!nombreMateria || !profesor || !grupo || !carrera) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const nuevoCurso = new Curso({
            nombreMateria,
            profesor,
            grupo,
            carrera
        });

        await nuevoCurso.save();

        res.json({ mensaje: "Curso registrado correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

//OBTENER UNIVERSIDADES..............................................................................................................
app.get("/universidades", async (req, res) => {
    const universidades = await Universidad.find();
    res.json(universidades);
});

//ELIMINAR UNIVERSIDAD.............................................................................................................
app.delete("/universidades/:id", async (req, res) => {
    try {
        await Universidad.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Universidad eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

//OBTENER CARRERAS..................................................................................................................
app.get("/carreras/:universidadId", async (req, res) => {
    const carreras = await Carrera.find({
        universidadId: req.params.universidadId
    });
    res.json(carreras);
});

// ELIMINAR CARRERA..................................................................................................................
app.delete("/carreras/:id", async (req, res) => {
    try {
        await Carrera.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Carrera eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

// OBTENER PROFESORES..................................................................................................................
app.get("/profesores", async (req, res) => {
    const profesores = await Usuario.find({ rol: "profesor" });
    res.json(profesores);
});
//OBTENER LAS CARRERAS PARA CURSOS
app.get("/carreras", async (req, res) => {
    const carreras = await Carrera.find();
    res.json(carreras);
});

// OBTENER CURSOS..................................................................................................................
app.get("/cursos", async (req, res) => {
    const cursos = await Curso.find()
        .populate("profesor", "nombre email")
        .populate("carrera", "nombre");

    res.json(cursos);
});

// ELIMINAR CURSOS..................................................................................................................
app.delete("/cursos/:id", async (req, res) => {
    try {
        await Curso.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Curso eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

//INICIAR SERVIDOR (siempre va al ultimo)......................................................................................
app.listen(3000, () => {
    console.log("🔥 Servidor corriendo en http://localhost:3000");
});