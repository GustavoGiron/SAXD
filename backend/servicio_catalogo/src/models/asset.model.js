const { getPool, sql } = require('../config/database');

class AssetModel {
  // ... métodos existentes ...

  // NUEVO MÉTODO: Crear asset con ruta local
  async createWithLocalPath(assetData) {
    const pool = getPool();
    const result = await pool.request()
      .input('id_contenido', sql.BigInt, assetData.id_contenido)
      .input('tipo_activo', sql.NVarChar(20), assetData.tipo_activo)
      .input('url', sql.NVarChar(500), assetData.url)
      .input('ruta_local', sql.NVarChar(500), assetData.ruta_local)
      .input('idioma', sql.NVarChar(10), assetData.idioma)
      .input('tamanio_bytes', sql.BigInt, assetData.tamanio_bytes)
      .input('mime_type', sql.NVarChar(100), assetData.mime_type)
      .query(`
        INSERT INTO catalogo.Activos (
          id_contenido, tipo_activo, url, ruta_local, 
          idioma, tamanio_bytes, mime_type
        )
        OUTPUT INSERTED.id_activo
        VALUES (
          @id_contenido, @tipo_activo, @url, @ruta_local,
          @idioma, @tamanio_bytes, @mime_type
        )
      `);
    
    return result.recordset[0].id_activo;
  }

  // NUEVO MÉTODO: Buscar asset por filename
  async findByFilename(contentId, filename) {
    const pool = getPool();
    const result = await pool.request()
      .input('contentId', sql.BigInt, contentId)
      .input('filename', sql.NVarChar(500), `%${filename}`)
      .query(`
        SELECT 
          id_activo,
          id_contenido,
          tipo_activo,
          url,
          ruta_local,
          idioma,
          tamanio_bytes,
          mime_type,
          fecha_creacion
        FROM catalogo.Activos
        WHERE id_contenido = @contentId
          AND ruta_local LIKE @filename
      `);
    
    return result.recordset[0];
  }

  // MODIFICADO: Agregar campos nuevos al obtener por content ID
  async findByContentId(contentId) {
    const pool = getPool();
    const result = await pool.request()
      .input('contentId', sql.BigInt, contentId)
      .query(`
        SELECT 
          id_activo,
          id_contenido,
          tipo_activo,
          url,
          ruta_local,
          idioma,
          tamanio_bytes,
          mime_type,
          fecha_creacion
        FROM catalogo.Activos
        WHERE id_contenido = @contentId
        ORDER BY tipo_activo, idioma
      `);
    
    return result.recordset;
  }

  // Los demás métodos permanecen igual...
}

module.exports = new AssetModel();