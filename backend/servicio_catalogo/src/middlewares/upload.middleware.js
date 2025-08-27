const upload = require('../config/upload');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class UploadMiddleware {
  // Middleware para una sola imagen
  uploadSingle(fieldName) {
    return upload.single(fieldName);
  }

  // Middleware para múltiples imágenes
  uploadMultiple(fieldName, maxCount = 5) {
    return upload.array(fieldName, maxCount);
  }

  // Middleware para procesar y optimizar imágenes después de la carga
  async processImage(req, res, next) {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      const processedFiles = [];

      for (const file of files) {
        // Solo procesar imágenes, no videos
        if (file.mimetype.startsWith('image/')) {
          const inputPath = file.path;
          const outputDir = path.dirname(inputPath);
          const fileName = path.basename(inputPath, path.extname(inputPath));
          
          // Crear versiones de diferentes tamaños
          const sizes = [
            { suffix: '_thumb', width: 200, height: 300 },
            { suffix: '_medium', width: 400, height: 600 },
            { suffix: '_large', width: 800, height: 1200 }
          ];

          const versions = [];

          // Mantener original
          versions.push({
            type: 'original',
            path: file.path,
            filename: file.filename,
            size: file.size
          });

          // Crear versiones redimensionadas
          for (const size of sizes) {
            const outputPath = path.join(
              outputDir,
              `${fileName}${size.suffix}.webp`
            );

            await sharp(inputPath)
              .resize(size.width, size.height, { 
                fit: 'cover',
                position: 'center'
              })
              .webp({ quality: 85 })
              .toFile(outputPath);

            const stats = await fs.stat(outputPath);
            
            versions.push({
              type: size.suffix.substring(1),
              path: outputPath,
              filename: `${fileName}${size.suffix}.webp`,
              size: stats.size
            });
          }

          processedFiles.push({
            original: file,
            versions: versions
          });
        } else {
          // Para videos, solo mantener el archivo original
          processedFiles.push({
            original: file,
            versions: [{
              type: 'original',
              path: file.path,
              filename: file.filename,
              size: file.size
            }]
          });
        }
      }

      req.processedFiles = processedFiles;
      next();
    } catch (error) {
      logger.error('Error processing image:', error);
      next(error);
    }
  }

  // Middleware para limpiar archivos en caso de error
  cleanupFiles() {
    return async (err, req, res, next) => {
      if (err && req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Error cleaning up file:', unlinkError);
        }
      }
      
      if (err && req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            logger.error('Error cleaning up file:', unlinkError);
          }
        }
      }
      
      next(err);
    };
  }
}

module.exports = new UploadMiddleware();