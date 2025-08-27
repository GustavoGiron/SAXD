const express = require('express');
const { registrarUsuario, confirmarCorreo, loginUsuario} = require('../controladores/authControlador');

const router = express.Router();

// Registro
router.post('/registro', registrarUsuario);

// Confirmación de correo
router.get('/confirmar/:token', confirmarCorreo);

// Login
router.post('/login', loginUsuario);

module.exports = router;
