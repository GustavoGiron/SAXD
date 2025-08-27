const { getPool } = require('../config/database');

class ContentModel {
  async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        c.id_contenido,
        c.tipo,
        c.titulo,
        c.sinopsis,
        c.anio_estreno,
        c.clasificacion_edad,
        c.duracion_minutos,
        c.popularidad,
        c.activo,
        c.fecha_creacion,
        c.fecha_actualizacion
      FROM catalogo_contenido c
      WHERE c.activo = 1
    `;

    const params = [];

    if (filters.tipo) {
      query += ' AND c.tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.genero) {
      query += `
        AND EXISTS (
          SELECT 1 FROM catalogo_contenido_generos cg
          WHERE cg.id_contenido = c.id_contenido
          AND cg.id_genero = ?
        )
      `;
      params.push(filters.genero);
    }

    if (filters.anio) {
      query += ' AND c.anio_estreno = ?';
      params.push(filters.anio);
    }

    // Ordenamiento
    if (filters.orderBy === 'popularity') {
      query += ' ORDER BY c.popularidad DESC';
    } else if (filters.orderBy === 'recent') {
      query += ' ORDER BY c.fecha_creacion DESC';
    } else {
      query += ' ORDER BY c.titulo';
    }

    // Paginación
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        c.*,
        GROUP_CONCAT(g.nombre ORDER BY g.nombre SEPARATOR ', ') as generos
      FROM catalogo_contenido c
      LEFT JOIN catalogo_contenido_generos cg ON c.id_contenido = cg.id_contenido
      LEFT JOIN catalogo_generos g ON cg.id_genero = g.id_genero
      WHERE c.id_contenido = ? AND c.activo = 1
      GROUP BY c.id_contenido
    `, [id]);
    
    return rows[0];
  }

  async create(contentData) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.execute(`
        INSERT INTO catalogo_contenido (
          tipo, titulo, sinopsis, anio_estreno, 
          clasificacion_edad, duracion_minutos, popularidad
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        contentData.tipo,
        contentData.titulo,
        contentData.sinopsis,
        contentData.anio_estreno,
        contentData.clasificacion_edad,
        contentData.duracion_minutos,
        contentData.popularidad || 0
      ]);
      
      const contentId = result.insertId;
      
      // Insertar géneros si existen
      if (contentData.generos && contentData.generos.length > 0) {
        for (const generoId of contentData.generos) {
          await connection.execute(`
            INSERT INTO catalogo_contenido_generos (id_contenido, id_genero)
            VALUES (?, ?)
          `, [contentId, generoId]);
        }
      }
      
      await connection.commit();
      return contentId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id, contentData) {
    const pool = getPool();
    const updateFields = [];
    const params = [];
    
    if (contentData.titulo !== undefined) {
      updateFields.push('titulo = ?');
      params.push(contentData.titulo);
    }
    
    if (contentData.sinopsis !== undefined) {
      updateFields.push('sinopsis = ?');
      params.push(contentData.sinopsis);
    }
    
    if (contentData.clasificacion_edad !== undefined) {
      updateFields.push('clasificacion_edad = ?');
      params.push(contentData.clasificacion_edad);
    }
    
    if (contentData.popularidad !== undefined) {
      updateFields.push('popularidad = ?');
      params.push(contentData.popularidad);
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    params.push(id);
    
    const query = `
      UPDATE catalogo_contenido
      SET ${updateFields.join(', ')}
      WHERE id_contenido = ?
    `;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(`
      UPDATE catalogo_contenido
      SET activo = 0
      WHERE id_contenido = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }

  async getPopular(limit = 15) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        c.id_contenido,
        c.tipo,
        c.titulo,
        c.sinopsis,
        c.anio_estreno,
        c.clasificacion_edad,
        c.duracion_minutos,
        c.popularidad
      FROM catalogo_contenido c
      WHERE c.activo = 1
      ORDER BY c.popularidad DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  }

  async getRecentlyAdded(limit = 20) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        c.id_contenido,
        c.tipo,
        c.titulo,
        c.sinopsis,
        c.anio_estreno,
        c.clasificacion_edad,
        c.duracion_minutos,
        c.popularidad,
        c.fecha_creacion
      FROM catalogo_contenido c
      WHERE c.activo = 1
      ORDER BY c.fecha_creacion DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  }
}

module.exports = new ContentModel();