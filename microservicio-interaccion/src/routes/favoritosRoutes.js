const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const { body, param, query, validationResult } = require('express-validator');

// Middleware de validación
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};

// Validaciones comunes
const validateIdPerfil = param('id_perfil').isInt({ min: 1 }).withMessage('ID de perfil inválido');
const validateIdContenido = param('id_contenido').isInt({ min: 1 }).withMessage('ID de contenido inválido');
const validatePagination = [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit debe ser entre 1 y 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset debe ser >= 0'),
    query('orden').optional().isIn(['ASC', 'DESC']).withMessage('Orden debe ser ASC o DESC')
];

// Rutas de Favoritos
router.get('/perfil/:id_perfil/favoritos',
    validateIdPerfil,
    ...validatePagination,
    validateRequest,
    favoritosController.obtenerFavoritos
);

router.post('/perfil/:id_perfil/favoritos',
    validateIdPerfil,
    body('id_contenido').isInt({ min: 1 }).withMessage('ID de contenido requerido'),
    validateRequest,
    favoritosController.agregarFavorito
);

router.delete('/perfil/:id_perfil/favoritos/:id_contenido',
    validateIdPerfil,
    validateIdContenido,
    validateRequest,
    favoritosController.eliminarFavorito
);

router.get('/perfil/:id_perfil/favoritos/:id_contenido/verificar',
    validateIdPerfil,
    validateIdContenido,
    validateRequest,
    favoritosController.verificarFavorito
);

router.post('/perfil/:id_perfil/favoritos/batch',
    validateIdPerfil,
    body('contenidos').isArray({ min: 1, max: 50 }).withMessage('Array de contenidos requerido (max 50)'),
    body('contenidos.*').isInt({ min: 1 }).withMessage('IDs de contenido deben ser enteros positivos'),
    validateRequest,
    favoritosController.agregarMultiplesFavoritos
);

module.exports = router;

// src/routes/verLuegoRoutes.js
const express2 = require('express');
const router2 = express2.Router();
const verLuegoController = require('../controllers/verLuegoController');

// Rutas de Ver Luego
router2.get('/perfil/:id_perfil/verluego',
    validateIdPerfil,
    ...validatePagination,
    validateRequest,
    verLuegoController.obtenerVerLuego
);

router2.post('/perfil/:id_perfil/verluego',
    validateIdPerfil,
    body('id_contenido').isInt({ min: 1 }).withMessage('ID de contenido requerido'),
    validateRequest,
    verLuegoController.agregarVerLuego
);

router2.delete('/perfil/:id_perfil/verluego/:id_contenido',
    validateIdPerfil,
    validateIdContenido,
    validateRequest,
    verLuegoController.eliminarVerLuego
);

router2.get('/perfil/:id_perfil/verluego/:id_contenido/verificar',
    validateIdPerfil,
    validateIdContenido,
    validateRequest,
    verLuegoController.verificarVerLuego
);

router2.get('/perfil/:id_perfil/listas',
    validateIdPerfil,
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit debe ser entre 1 y 50'),
    validateRequest,
    verLuegoController.obtenerListasCombinadas
);

router2.post('/perfil/:id_perfil/verluego/:id_contenido/mover-favoritos',
    validateIdPerfil,
    validateIdContenido,
    validateRequest,
    verLuegoController.moverAFavoritos
);

module.exports.favoritosRoutes = router;
module.exports.verLuegoRoutes = router2;