const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const uploadMiddleware = require('../middlewares/upload.middleware');
//const authMiddleware = require('../middlewares/auth.middleware');
//const validationMiddleware = require('../middlewares/validation.middleware');
//const contentValidator = require('../validators/content.validator');

/**
 * @swagger
 * paths:
 *  /content:
 *      get:
 *          summary : Some summary
 *          tags:
 *              - Account Types
 *          description: Some description
 *          schema:
 *              type: string
 *          responses:
 *              '200':
 *                  description: Success Description
 */
router.get('/', 
  //authMiddleware.validateToken,
  contentController.getAll
);

router.get('/popular',
  //authMiddleware.validateToken,
  contentController.getPopular
);

router.get('/recent',
  //authMiddleware.validateToken,
  contentController.getRecentlyAdded
);

router.get('/:id',
  //authMiddleware.validateToken,
  contentController.getById
);

router.get('/:contentId/image/:filename',
  contentController.getImage
);

/**
 * @swagger
 * paths:
 *  /content:
 *      post:
 *          summary : Some summary
 *          tags:
 *              - Account Types
 *          description: Some description
 *          requestBody:
 *              requiered: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - tipo
 *                              - titulo
 *                              - sinopsis
 *                              - anio_estreno
 *                              - claisificacion_edad
 *                              - duracion_minutos
 *                              - popularidad
 * 
 *          schema:
 *              type: string
 *          responses:
 *              '200':
 *                  description: Success Description
 */

router.post('/',
  //authMiddleware.validateToken,
  //authMiddleware.requireRole('admin', 'content_manager'),
  //validationMiddleware(contentValidator.createSchema),
  contentController.create
);

router.post('/with-images',
  //authMiddleware.validateToken,
  //authMiddleware.requireRole('admin', 'content_manager'),
  uploadMiddleware.uploadMultiple('images', 5),
  uploadMiddleware.processImage,
  contentController.createWithImages
);

// NUEVA RUTA: Agregar imagen a contenido existente
router.post('/:id/image',
  //authMiddleware.validateToken,
  //authMiddleware.requireRole('admin', 'content_manager'),
  uploadMiddleware.uploadSingle('image'),
  uploadMiddleware.processImage,
  contentController.addImage
);

router.put('/:id',
//   authMiddleware.validateToken,
//   authMiddleware.requireRole('admin', 'content_manager'),
//   validationMiddleware(contentValidator.updateSchema),
   contentController.update
);

router.delete('/:id',
//   authMiddleware.validateToken,
//   authMiddleware.requireRole('admin'),
   contentController.delete
);

module.exports = {router};