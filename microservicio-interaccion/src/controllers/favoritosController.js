const { executeQuery, executeTransaction } = require('../config/database');

class FavoritosController {
    // Obtener todos los favoritos de un perfil
    async obtenerFavoritos(req, res) {
        try {
            const { id_perfil } = req.params;
            const { limit = '20', offset = '0', orden = 'DESC' } = req.query;

            // Asegurar que los valores sean números válidos
            const limitNum = parseInt(limit) || 20;
            const offsetNum = parseInt(offset) || 0;
            const ordenSql = orden === 'ASC' ? 'ASC' : 'DESC';

            // Query sin parámetros para LIMIT/OFFSET (workaround para MySQL)
            const query = `
                SELECT 
                    id_contenido,
                    agregado_en,
                    DATE_FORMAT(agregado_en, '%Y-%m-%d %H:%i:%s') as fecha_formateada
                FROM Favoritos 
                WHERE id_perfil = ?
                ORDER BY agregado_en ${ordenSql}
                LIMIT ${limitNum} OFFSET ${offsetNum}
            `;

            const favoritos = await executeQuery(query, [parseInt(id_perfil)]);

            // Obtener el total de favoritos
            const countQuery = 'SELECT COUNT(*) as total FROM Favoritos WHERE id_perfil = ?';
            const [countResult] = await executeQuery(countQuery, [parseInt(id_perfil)]);

            res.status(200).json({
                success: true,
                data: {
                    favoritos,
                    pagination: {
                        total: countResult.total,
                        limit: limitNum,
                        offset: offsetNum,
                        hasMore: countResult.total > offsetNum + limitNum
                    }
                },
                message: 'Favoritos obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo favoritos:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Agregar a favoritos
    async agregarFavorito(req, res) {
        try {
            const { id_perfil } = req.params;
            const { id_contenido } = req.body;

            if (!id_contenido) {
                return res.status(400).json({
                    success: false,
                    error: 'El id_contenido es requerido'
                });
            }

            // Verificar si ya existe
            const checkQuery = 'SELECT 1 FROM Favoritos WHERE id_perfil = ? AND id_contenido = ?';
            const exists = await executeQuery(checkQuery, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            if (exists.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'El contenido ya está en favoritos'
                });
            }

            // Insertar nuevo favorito
            const insertQuery = 'INSERT INTO Favoritos (id_perfil, id_contenido) VALUES (?, ?)';
            const result = await executeQuery(insertQuery, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            res.status(201).json({
                success: true,
                data: {
                    id_perfil: parseInt(id_perfil),
                    id_contenido: parseInt(id_contenido),
                    agregado_en: new Date()
                },
                message: 'Agregado a favoritos exitosamente'
            });
        } catch (error) {
            console.error('Error agregando favorito:', error);
            res.status(500).json({
                success: false,
                error: 'Error al agregar a favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar de favoritos
    async eliminarFavorito(req, res) {
        try {
            const { id_perfil, id_contenido } = req.params;

            const deleteQuery = 'DELETE FROM Favoritos WHERE id_perfil = ? AND id_contenido = ?';
            const result = await executeQuery(deleteQuery, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'El contenido no está en favoritos'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Eliminado de favoritos exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando favorito:', error);
            res.status(500).json({
                success: false,
                error: 'Error al eliminar de favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Verificar si un contenido está en favoritos
    async verificarFavorito(req, res) {
        try {
            const { id_perfil, id_contenido } = req.params;

            const query = 'SELECT agregado_en FROM Favoritos WHERE id_perfil = ? AND id_contenido = ?';
            const result = await executeQuery(query, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    esFavorito: result.length > 0,
                    agregado_en: result.length > 0 ? result[0].agregado_en : null
                }
            });
        } catch (error) {
            console.error('Error verificando favorito:', error);
            res.status(500).json({
                success: false,
                error: 'Error al verificar favorito',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Agregar múltiples favoritos (batch)
    async agregarMultiplesFavoritos(req, res) {
        try {
            const { id_perfil } = req.params;
            const { contenidos } = req.body;

            if (!Array.isArray(contenidos) || contenidos.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Se requiere un array de contenidos'
                });
            }

            const result = await executeTransaction(async (connection) => {
                const agregados = [];
                const duplicados = [];
                const errores = [];

                for (const id_contenido of contenidos) {
                    try {
                        // Verificar si existe
                        const [exists] = await connection.execute(
                            'SELECT 1 FROM Favoritos WHERE id_perfil = ? AND id_contenido = ?',
                            [parseInt(id_perfil), parseInt(id_contenido)]
                        );

                        if (exists.length > 0) {
                            duplicados.push(id_contenido);
                        } else {
                            await connection.execute(
                                'INSERT INTO Favoritos (id_perfil, id_contenido) VALUES (?, ?)',
                                [parseInt(id_perfil), parseInt(id_contenido)]
                            );
                            agregados.push(id_contenido);
                        }
                    } catch (error) {
                        errores.push({ id_contenido, error: error.message });
                    }
                }

                return { agregados, duplicados, errores };
            });

            res.status(200).json({
                success: true,
                data: result,
                message: `${result.agregados.length} contenidos agregados a favoritos`
            });
        } catch (error) {
            console.error('Error agregando múltiples favoritos:', error);
            res.status(500).json({
                success: false,
                error: 'Error al agregar múltiples favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new FavoritosController();