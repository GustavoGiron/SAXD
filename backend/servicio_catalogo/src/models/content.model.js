const { getPool, sql } = require('../config/database');

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
      FROM catalogo.Contenido c
      WHERE c.activo = 1
    `;

    const request = pool.request();

    if (filters.tipo) {
      query += ' AND c.tipo = @tipo';
      request.input('tipo', sql.Char(1), filters.tipo);
    }

    if (filters.genero) {
      query += `
        AND EXISTS (
          SELECT 1 FROM catalogo.ContenidoGeneros cg
          WHERE cg.id_contenido = c.id_contenido
          AND cg.id_genero = @genero
        )
      `;
      request.input('genero', sql.Int, filters.genero);
    }

    if (filters.anio) {
      query += ' AND c.anio_estreno = @anio';
      request.input('anio', sql.SmallInt, filters.anio);
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
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    return result.recordset;
  }

  async findById(id) {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          c.*,
          STRING_AGG(g.nombre, ',') WITHIN GROUP (ORDER BY g.nombre) as generos
        FROM catalogo.Contenido c
        LEFT JOIN catalogo.ContenidoGeneros cg ON c.id_contenido = cg.id_contenido
        LEFT JOIN catalogo.Generos g ON cg.id_genero = g.id_genero
        WHERE c.id_contenido = @id AND c.activo = 1
        GROUP BY c.id_contenido, c.tipo, c.titulo, c.sinopsis, 
                 c.anio_estreno, c.clasificacion_edad, c.duracion_minutos,
                 c.popularidad, c.activo, c.fecha_creacion, c.fecha_actualizacion
      `);
    
    return result.recordset[0];
  }

  async create(contentData) {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      const result = await transaction.request()
        .input('tipo', sql.Char(1), contentData.tipo)
        .input('titulo', sql.NVarChar(200), contentData.titulo)
        .input('sinopsis', sql.NVarChar(sql.MAX), contentData.sinopsis)
        .input('anio_estreno', sql.SmallInt, contentData.anio_estreno)
        .input('clasificacion_edad', sql.NVarChar(10), contentData.clasificacion_edad)
        .input('duracion_minutos', sql.Int, contentData.duracion_minutos)
        .input('popularidad', sql.Decimal(9, 4), contentData.popularidad || 0)
        .query(`
          INSERT INTO catalogo.Contenido (
            tipo, titulo, sinopsis, anio_estreno, 
            clasificacion_edad, duracion_minutos, popularidad
          )
          OUTPUT INSERTED.id_contenido
          VALUES (
            @tipo, @titulo, @sinopsis, @anio_estreno,
            @clasificacion_edad, @duracion_minutos, @popularidad
          )
        `);
      
      const contentId = result.recordset[0].id_contenido;
      
      // Insertar géneros si existen
      if (contentData.generos && contentData.generos.length > 0) {
        for (const generoId of contentData.generos) {
          await transaction.request()
            .input('id_contenido', sql.BigInt, contentId)
            .input('id_genero', sql.Int, generoId)
            .query(`
              INSERT INTO catalogo.ContenidoGeneros (id_contenido, id_genero)
              VALUES (@id_contenido, @id_genero)
            `);
        }
      }
      
      await transaction.commit();
      return contentId;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id, contentData) {
    const pool = getPool();
    const request = pool.request()
      .input('id', sql.BigInt, id);
    
    let updateFields = [];
    
    if (contentData.titulo !== undefined) {
      updateFields.push('titulo = @titulo');
      request.input('titulo', sql.NVarChar(200), contentData.titulo);
    }
    
    if (contentData.sinopsis !== undefined) {
      updateFields.push('sinopsis = @sinopsis');
      request.input('sinopsis', sql.NVarChar(sql.MAX), contentData.sinopsis);
    }
    
    if (contentData.clasificacion_edad !== undefined) {
      updateFields.push('clasificacion_edad = @clasificacion_edad');
      request.input('clasificacion_edad', sql.NVarChar(10), contentData.clasificacion_edad);
    }
    
    if (contentData.popularidad !== undefined) {
      updateFields.push('popularidad = @popularidad');
      request.input('popularidad', sql.Decimal(9, 4), contentData.popularidad);
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    const query = `
      UPDATE catalogo.Contenido
      SET ${updateFields.join(', ')}
      WHERE id_contenido = @id
    `;
    
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  async delete(id) {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        UPDATE catalogo.Contenido
        SET activo = 0
        WHERE id_contenido = @id
      `);
    
    return result.rowsAffected[0] > 0;
  }

  async getPopular(limit = 15) {
    const pool = getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          c.id_contenido,
          c.tipo,
          c.titulo,
          c.sinopsis,
          c.anio_estreno,
          c.clasificacion_edad,
          c.duracion_minutos,
          c.popularidad
        FROM catalogo.Contenido c
        WHERE c.activo = 1
        ORDER BY c.popularidad DESC
      `);
    
    return result.recordset;
  }

  async getRecentlyAdded(limit = 20) {
    const pool = getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          c.id_contenido,
          c.tipo,
          c.titulo,
          c.sinopsis,
          c.anio_estreno,
          c.clasificacion_edad,
          c.duracion_minutos,
          c.popularidad,
          c.fecha_creacion
        FROM catalogo.Contenido c
        WHERE c.activo = 1
        ORDER BY c.fecha_creacion DESC
      `);
    
    return result.recordset;
  }


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

}

module.exports = new ContentModel();