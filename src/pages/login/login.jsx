import React, { useState } from 'react';
import './login.css';

function Login() {
  // Estados para Registro
  const [nombre, setNombre] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [mensajeReg, setMensajeReg] = useState({ texto: '', color: 'red' });

  // Estados para Login
  const [emailLog, setEmailLog] = useState('');
  const [passwordLog, setPasswordLog] = useState('');
  const [mensajeLog, setMensajeLog] = useState({ texto: '', color: 'red' });

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email: emailReg, password: passwordReg })
      });
      const data = await res.json();
      if (res.ok) {
        setMensajeReg({ texto: data.mensaje, color: 'lightgreen' });
      } else {
        setMensajeReg({ texto: data.error || 'Error en el registro', color: 'red' });
      }
    } catch (error) {
      setMensajeReg({ texto: "Error de conexión con el servidor", color: 'red' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLog, password: passwordLog })
      });
      const data = await res.json();
      if (res.ok) {
        setMensajeLog({ texto: data.mensaje, color: 'lightgreen' });
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setTimeout(() => {
          window.location.href = "/dashboard"; // O la ruta de tu index
        }, 1000);
      } else {
        setMensajeLog({ texto: data.error || 'Error en el login', color: 'red' });
      }
    } catch (error) {
      setMensajeLog({ texto: "Error de conexión con el servidor", color: 'red' });
    }
  };

  return (
    <div className="login-page-wrapper">
      <input type="checkbox" id="toggle" style={{ display: 'none' }} />

      <div className="container">
        {/* FORMULARIO DE LOGIN */}
        <div className="form-container login-container">
          <form onSubmit={handleLogin}>
            <h1>Iniciar Sesión</h1>
            <input 
              type="email" 
              placeholder="Correo" 
              required 
              value={emailLog}
              onChange={(e) => setEmailLog(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={passwordLog}
              onChange={(e) => setPasswordLog(e.target.value)}
            />
            <button type="submit">Entrar</button>
            <label htmlFor="toggle" className="switch">¿No tienes cuenta? Registrarme</label>
            <p style={{ marginTop: '10px', color: mensajeLog.color }}>
              {mensajeLog.texto}
            </p>
          </form>
        </div>

        {/* FORMULARIO DE REGISTRO */}
        <div className="form-container register-container">
          <form onSubmit={handleRegistro}>
            <h1>Crear Cuenta</h1>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              required 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Correo" 
              required 
              value={emailReg}
              onChange={(e) => setEmailReg(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              value={passwordReg}
              onChange={(e) => setPasswordReg(e.target.value)}
            />
            <button type="submit">Registrar</button>
            <label htmlFor="toggle" className="switch">Ya tengo cuenta</label>
            <p style={{ marginTop: '10px', color: mensajeReg.color }}>
              {mensajeReg.texto}
            </p>
          </form>
        </div>

        {/* PANELES DE OVERLAY (DISEÑO) */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Ingresa tus datos para continuar</p>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hola, amigo!</h1>
              <p>Regístrate para comenzar tu experiencia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;