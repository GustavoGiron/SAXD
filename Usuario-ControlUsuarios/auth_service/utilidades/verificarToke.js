import jwt from "jsonwebtoken";

const claveSecreta = process.env.JWT_SECRET;

// Middleware para verificar el token
export const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]; // El token viene en los headers

  if (!token) {
    return res.status(403).json({ mensaje: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    // Validamos el token
    const verificado = jwt.verify(token, claveSecreta);
    req.usuario = verificado; // Guardamos la info del usuario en la petición
    next(); // Continua con la siguiente función o ruta
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }
};
