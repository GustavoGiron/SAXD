const conexion = require('../config/db');
const { generarHash, compararHash } = require('../utilidades/hash');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.CORREO_USUARIO,
        pass: process.env.CORREO_CONTRASENA
    }
});

// REGISTRO
const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, correo, contraseña, nombres, apellidos, telefono, fecha_nacimiento, sexo, imagen_perfil } = req.body;

        // Buscar si el usuario o correo ya existen
        const [usuariosExistentes] = await conexion.query(
            'SELECT * FROM usuarios WHERE nombre_usuario = ? OR correo = ?',
            [nombre_usuario, correo]
        );

        if (usuariosExistentes.length > 0) {
            const usuario = usuariosExistentes[0];

            if (usuario.verificado) {
                // Usuario ya existe y está verificado
                return res.status(400).json({ mensaje: 'Usuario o correo ya existe' });
            } else {
                // Usuario existe pero NO está verificado → reenviar token
                const nuevoToken = crypto.randomBytes(20).toString('hex');
                const nuevaExpiracion = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

                await conexion.query(
                    'UPDATE usuarios SET token_verificacion = ?, expiracion_token = ? WHERE id = ?',
                    [nuevoToken, nuevaExpiracion, usuario.id]
                );

                // Enviar correo con estilo mejorado
                const mensaje = {
                    from: process.env.CORREO_USUARIO,
                    to: correo,
                    subject: 'Confirmar correo Chapinflix',
                    html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                        <h2 style="color: #e50914;">¡Hola ${usuario.nombres}!</h2>
                        <p>Notamos que no confirmaste tu correo aún. Haz clic en el siguiente botón para confirmar tu cuenta:</p>
                        <a href="http://localhost:${process.env.PORT}/api/auth/confirmar/${nuevoToken}" 
                           style="display: inline-block; padding: 10px 20px; background-color: #e50914; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                           Confirmar correo
                        </a>
                        <p>Este enlace expirará en 2 minutos.</p>
                        <hr>
                        <p style="font-size: 12px; color: #666;">Si no solicitaste esta acción, puedes ignorar este correo.</p>
                    </div>`
                };
                await transporter.sendMail(mensaje);

                return res.status(200).json({
                    mensaje: 'Usuario previamente registrado pero no verificado. Se ha enviado un nuevo correo de verificación.'
                });
            }
        }

        // Usuario no existe → crear normalmente
        const hash = await generarHash(contraseña);
        const token = crypto.randomBytes(20).toString('hex');
        const expiracion = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

        await conexion.query(
            'INSERT INTO usuarios (nombre_usuario, correo, contrasenia, nombres, apellidos, telefono, fecha_nacimiento, sexo, imagen_perfil, token_verificacion, expiracion_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre_usuario, correo, hash, nombres, apellidos, telefono, fecha_nacimiento, sexo, imagen_perfil, token, expiracion]
        );

        // Enviar correo de verificación con estilo
        const mensaje = {
            from: process.env.CORREO_USUARIO,
            to: correo,
            subject: 'Confirmar correo Chapinflix',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #e50914;">¡Hola ${nombres}!</h2>
                <p>Gracias por registrarte en Chapinflix. Haz clic en el siguiente botón para confirmar tu cuenta:</p>
                <a href="http://localhost:${process.env.PORT}/api/auth/confirmar/${token}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #e50914; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                   Confirmar correo
                </a>
                <p>Este enlace expirará en 2 minutos.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Si no solicitaste esta acción, puedes ignorar este correo.</p>
            </div>`
        };
        await transporter.sendMail(mensaje);

        res.status(201).json({ mensaje: 'Usuario registrado, revisa tu correo para confirmar' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};



// CONFIRMAR CORREO
const confirmarCorreo = async (req, res) => {
    try {
        const { token } = req.params;
        const [usuarios] = await conexion.query(
            'SELECT * FROM usuarios WHERE token_verificacion = ?',
            [token]
        );

        if (usuarios.length === 0) return res.status(400).send('Token inválido');

        const usuario = usuarios[0];
        if (new Date(usuario.expiracion_token) < new Date()) return res.status(400).send('Token expirado');

        // Actualizar usuario como verificado
        await conexion.query(
            'UPDATE usuarios SET verificado = ?, token_verificacion = NULL, expiracion_token = NULL, estado_cuenta = ? WHERE id = ?',
            [true, 'A', usuario.id]
        );

        res.send('Correo confirmado, ya puedes iniciar sesión');

    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

// LOGIN
const jwt = require('jsonwebtoken');

const loginUsuario = async (req, res) => {
    try {
        const { usuario, contraseña } = req.body;

        if (!usuario || !contraseña) {
            return res.status(400).json({ mensaje: 'Debe enviar usuario y contraseña' });
        }

        // Buscar usuario por nombre_usuario o correo
        const [usuarios] = await conexion.query(
            'SELECT * FROM usuarios WHERE nombre_usuario = ? OR correo = ?',
            [usuario, usuario]
        );

        if (usuarios.length === 0) return res.status(400).json({ mensaje: 'Usuario no encontrado' });

        const usuarioEncontrado = usuarios[0];

        // Verificar contraseña
        const valido = await compararHash(contraseña, usuarioEncontrado.contrasenia);
        if (!valido) return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

        // Verificar correo confirmado
        if (!usuarioEncontrado.verificado) return res.status(400).json({ mensaje: 'Correo no confirmado' });

        // Verificar estado de la cuenta
        if (usuarioEncontrado.estado_cuenta !== 'A') {
            return res.status(400).json({ mensaje: 'Cuenta inactiva o suspendida' });
        }
        
        // Generar JWT
        const token = jwt.sign(
            { id: usuarioEncontrado.id, nombre_usuario: usuarioEncontrado.nombre_usuario, tipo_suscripcion: usuarioEncontrado.tipo_suscripcion },
            process.env.JWT_SECRETO,
            { expiresIn: process.env.JWT_EXPIRACION }
        );

        res.json({ mensaje: 'Login exitoso', token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = { registrarUsuario, confirmarCorreo, loginUsuario };
