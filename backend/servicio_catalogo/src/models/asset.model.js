const { getPool } = require('../config/database');

class AssetModel {
  
  // Crear asset con ruta local
  async createWithLocalPath(assetData) {
    const pool = getPool();
    const [result] = await pool.execute(`
      INSERT INTO catalogo_activos (
        id_contenido, tipo_activo, url, ruta_local, 
        idioma, tamanio_bytes, mime_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      assetData.id_contenido,
      assetData.tipo_activo,
      assetData.url,
      assetData.ruta_local,
      assetData.idioma,
      assetData.tamanio_bytes,
      assetData.mime_type
    ]);
    
    return result.insertId;
  }

  // Buscar asset por filename
  async findByFilename(contentId, filename) {
    const pool = getPool();
    const [rows] = await pool.execute(`
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
      FROM catalogo_activos
      WHERE id_contenido = ?
        AND ruta_local LIKE ?
    `, [contentId, `%${filename}`]);
    
    return rows[0];
  }

  // Obtener todos los assets de un contenido
  async findByContentId(contentId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
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
      FROM catalogo_activos
      WHERE id_contenido = ?
      ORDER BY tipo_activo, idioma
    `, [contentId]);
    
    return rows;
  }

  // Crear asset básico
  async create(assetData) {
    const pool = getPool();
    const [result] = await pool.execute(`
      INSERT INTO catalogo_activos (
        id_contenido, tipo_activo, url, idioma
      )
      VALUES (?, ?, ?, ?)
    `, [
      assetData.id_contenido,
      assetData.tipo_activo,
      assetData.url,
      assetData.idioma
    ]);
    
    return result.insertId;
  }

  // Actualizar asset
  async update(id, assetData) {
    const pool = getPool();
    const updateFields = [];
    const params = [];
    
    if (assetData.url !== undefined) {
      updateFields.push('url = ?');
      params.push(assetData.url);
    }
    
    if (assetData.ruta_local !== undefined) {
      updateFields.push('ruta_local = ?');
      params.push(assetData.ruta_local);
    }
    
    if (assetData.tamanio_bytes !== undefined) {
      updateFields.push('tamanio_bytes = ?');
      params.push(assetData.tamanio_bytes);
    }
    
    if (assetData.mime_type !== undefined) {
      updateFields.push('mime_type = ?');
      params.push(assetData.mime_type);
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    params.push(id);
    
    const query = `
      UPDATE catalogo_activos
      SET ${updateFields.join(', ')}
      WHERE id_activo = ?
    `;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  // Eliminar asset
  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(`
      DELETE FROM catalogo_activos
      WHERE id_activo = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }

  // Eliminar todos los assets de un contenido
  async deleteByContentId(contentId) {
    const pool = getPool();
    const [result] = await pool.execute(`
      DELETE FROM catalogo_activos
      WHERE id_contenido = ?
    `, [contentId]);
    
    return result.affectedRows;
  }
}

module.exports = new AssetModel();