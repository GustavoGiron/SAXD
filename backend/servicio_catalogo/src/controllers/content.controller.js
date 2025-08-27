const contentModel = require('../models/content.model');
const assetModel = require('../models/asset.model');
const logger = require('../utils/logger');
const fs = require('fs');

class ContentController {
  async getAll(req, res) {
    try {
      const filters = {
        tipo: req.query.tipo,
        genero: req.query.genero,
        anio: req.query.anio,
        orderBy: req.query.orderBy,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const content = await contentModel.findAll(filters);
      
      res.json({
        success: true,
        data: content,
        pagination: {
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      logger.error('Error getting content:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving content'
      });
    }
  }

  async getById(req, res) {
    try {
      const content = await contentModel.findById(id);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      logger.error('Error getting content by id:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving content'
      });
    }
  }

  async create(req, res) {
    try {
      const contentId = await contentModel.create(req.body);
      
      res.status(201).json({
        success: true,
        data: {
          id: contentId,
          message: 'Content created successfully'
        }
      });
    } catch (error) {
      logger.error('Error creating content:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating content'
      });
    }
  }

  async createWithImages(req, res) {
    try {
      // Preparar datos del contenido
      const contentData = {
        ...req.body,
        generos: req.body.generos ? JSON.parse(req.body.generos) : []
      };

      // Preparar archivos procesados
      const imageAssets = [];
      if (req.processedFiles) {
        for (const processedFile of req.processedFiles) {
          for (const version of processedFile.versions) {
            imageAssets.push({
              tipo_activo: req.body.tipo_activo || 'poster',
              ruta_local: version.path,
              filename: version.filename,
              tamanio_bytes: version.size,
              mime_type: processedFile.original.mimetype,
              version_tipo: version.type,
              idioma: req.body.idioma || 'es'
            });
          }
        }
      }

      // Crear el contenido primero
      const contentId = await contentModel.create(contentData);
      
      // Luego crear los assets de imagen
      const createdAssets = [];
      for (const imageAsset of imageAssets) {
        const assetData = {
          id_contenido: contentId,
          tipo_activo: imageAsset.tipo_activo,
          url: `/api/v1/content/${contentId}/image/${imageAsset.filename}`,
          ruta_local: imageAsset.ruta_local,
          tamanio_bytes: imageAsset.tamanio_bytes,
          mime_type: imageAsset.mime_type,
          idioma: imageAsset.idioma
        };
        
        const assetId = await assetModel.createWithLocalPath(assetData);
        createdAssets.push({ id: assetId, ...assetData });
      }

      res.status(201).json({
        success: true,
        data: {
          id: contentId,
          message: 'Content created successfully with images',
          images: createdAssets
        }
      });
    } catch (error) {
      logger.error('Error creating content with images:', error);
      
      // Limpiar archivos si hay error
      if (req.processedFiles) {
        for (const file of req.processedFiles) {
          for (const version of file.versions) {
            try {
              await fs.unlink(version.path);
            } catch (e) {
              logger.error('Error removing file:', e);
            }
          }
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error creating content with images'
      });
    }
  }



  // Agregar imagen a contenido existente
  async addImage(req, res) {
    try {
      const contentId = req.params.id;
      
      if (!req.processedFiles || req.processedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const assets = [];
      for (const processedFile of req.processedFiles) {
        for (const version of processedFile.versions) {
          const assetData = {
            id_contenido: contentId,
            tipo_activo: req.body.tipo_activo || 'poster',
            ruta_local: version.path,
            url: `/uploads/${req.body.tipo_activo || 'poster'}s/${version.filename}`,
            tamanio_bytes: version.size,
            mime_type: processedFile.original.mimetype,
            idioma: req.body.idioma || 'es'
          };
          
          const assetId = await assetModel.createWithLocalPath(assetData);
          assets.push({ id: assetId, ...assetData });
        }
      }

      res.json({
        success: true,
        data: {
          message: 'Images added successfully',
          assets: assets
        }
      });
    } catch (error) {
      logger.error('Error adding image to content:', error);
      res.status(500).json({
        success: false,
        error: 'Error adding image to content'
      });
    }
  }

  // Obtener imagen
  async getImage(req, res) {
    try {
      const { contentId, filename } = req.params;
      const asset = await assetModel.findByFilename(contentId, filename);
      
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      // Enviar el archivo
      res.sendFile(asset.ruta_local);
    } catch (error) {
      logger.error('Error getting image:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving image'
      });
    }
  }

  async update(req, res) {
    try {
      const updated = await contentModel.update(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content updated successfully'
      });
    } catch (error) {
      logger.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating content'
      });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await contentModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting content'
      });
    }
  }

  async getPopular(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 15;
      const popular = await contentModel.getPopular(limit);
      
      res.json({
        success: true,
        data: popular
      });
    } catch (error) {
      logger.error('Error getting popular content:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving popular content'
      });
    }
  }

  async getRecentlyAdded(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const recent = await contentModel.getRecentlyAdded(limit);
      
      res.json({
        success: true,
        data: recent
      });
    } catch (error) {
      logger.error('Error getting recently added content:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving recently added content'
      });
    }
  }
}

module.exports = new ContentController();