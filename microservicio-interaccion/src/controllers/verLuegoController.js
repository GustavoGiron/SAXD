// src/controllers/verLuegoController.js
const { executeQuery, executeTransaction } = require('../config/database');

class VerLuegoController {
    // Obtener todos los elementos de ver luego de un perfil
    async obtenerVerLuego(req, res) {
        try {
            const { id_perfil } = req.params;
            const { limit = '20', offset = '0', orden = 'DESC' } = req.query;

            // Asegurar que los valores sean números válidos
            const limitNum = parseInt(limit) || 20;
            const offsetNum = parseInt(offset) || 0;
            const ordenSql = orden === 'ASC' ? 'ASC' : 'DESC';

            // Query sin parámetros para LIMIT/OFFSET (FIX para MySQL)
            const query = `
                SELECT 
                    id_contenido,
                    agregado_en,
                    DATE_FORMAT(agregado_en, '%Y-%m-%d %H:%i:%s') as fecha_formateada
                FROM VerLuego 
                WHERE id_perfil = ?
                ORDER BY agregado_en ${ordenSql}
                LIMIT ${limitNum} OFFSET ${offsetNum}
            `;

            const verLuego = await executeQuery(query, [parseInt(id_perfil)]);

            // Obtener el total
            const countQuery = 'SELECT COUNT(*) as total FROM VerLuego WHERE id_perfil = ?';
            const [countResult] = await executeQuery(countQuery, [parseInt(id_perfil)]);

            res.status(200).json({
                success: true,
                data: {
                    verLuego,
                    pagination: {
                        total: countResult.total,
                        limit: limitNum,
                        offset: offsetNum,
                        hasMore: countResult.total > offsetNum + limitNum
                    }
                },
                message: 'Lista Ver Luego obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo ver luego:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener lista Ver Luego',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Agregar a ver luego
    async agregarVerLuego(req, res) {
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
            const checkQuery = 'SELECT 1 FROM VerLuego WHERE id_perfil = ? AND id_contenido = ?';
            const exists = await executeQuery(checkQuery, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            if (exists.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'El contenido ya está en Ver Luego'
                });
            }

            // Insertar nuevo elemento
            const insertQuery = 'INSERT INTO VerLuego (id_perfil, id_contenido) VALUES (?, ?)';
            await executeQuery(insertQuery, [
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
                message: 'Agregado a Ver Luego exitosamente'
            });
        } catch (error) {
            console.error('Error agregando a ver luego:', error);
            res.status(500).json({
                success: false,
                error: 'Error al agregar a Ver Luego',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar de ver luego
    async eliminarVerLuego(req, res) {
        try {
            const { id_perfil, id_contenido } = req.params;

            const deleteQuery = 'DELETE FROM VerLuego WHERE id_perfil = ? AND id_contenido = ?';
            const result = await executeQuery(deleteQuery, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'El contenido no está en Ver Luego'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Eliminado de Ver Luego exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando de ver luego:', error);
            res.status(500).json({
                success: false,
                error: 'Error al eliminar de Ver Luego',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Verificar si un contenido está en ver luego
    async verificarVerLuego(req, res) {
        try {
            const { id_perfil, id_contenido } = req.params;

            const query = 'SELECT agregado_en FROM VerLuego WHERE id_perfil = ? AND id_contenido = ?';
            const result = await executeQuery(query, [
                parseInt(id_perfil),
                parseInt(id_contenido)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    enVerLuego: result.length > 0,
                    agregado_en: result.length > 0 ? result[0].agregado_en : null
                }
            });
        } catch (error) {
            console.error('Error verificando ver luego:', error);
            res.status(500).json({
                success: false,
                error: 'Error al verificar Ver Luego',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener listas combinadas (favoritos y ver luego)
    async obtenerListasCombinadas(req, res) {
        try {
            const { id_perfil } = req.params;
            const { limit = '20' } = req.query;
            const limitNum = parseInt(limit) || 20;

            // Query sin parámetros para LIMIT (workaround para MySQL)
            const query = `
                (SELECT 
                    'favoritos' as tipo_lista,
                    id_contenido,
                    agregado_en
                FROM Favoritos 
                WHERE id_perfil = ?
                ORDER BY agregado_en DESC
                LIMIT ${limitNum})
                
                UNION ALL
                
                (SELECT 
                    'ver_luego' as tipo_lista,
                    id_contenido,
                    agregado_en
                FROM VerLuego 
                WHERE id_perfil = ?
                ORDER BY agregado_en DESC
                LIMIT ${limitNum})
                
                ORDER BY agregado_en DESC
            `;

            const listas = await executeQuery(query, [
                parseInt(id_perfil),
                parseInt(id_perfil)
            ]);

            // Agrupar por tipo de lista
            const resultado = {
                favoritos: listas.filter(item => item.tipo_lista === 'favoritos'),
                verLuego: listas.filter(item => item.tipo_lista === 'ver_luego')
            };

            res.status(200).json({
                success: true,
                data: resultado,
                message: 'Listas combinadas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo listas combinadas:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener listas combinadas',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Mover de Ver Luego a Favoritos
    async moverAFavoritos(req, res) {
        try {
            const { id_perfil, id_contenido } = req.params;

            const resultado = await executeTransaction(async (connection) => {
                // Verificar si existe en Ver Luego
                const [verLuego] = await connection.execute(
                    'SELECT 1 FROM VerLuego WHERE id_perfil = ? AND id_contenido = ?',
                    [parseInt(id_perfil), parseInt(id_contenido)]
                );

                if (verLuego.length === 0) {
                    throw new Error('El contenido no está en Ver Luego');
                }

                // Verificar si ya está en Favoritos
                const [favorito] = await connection.execute(
                    'SELECT 1 FROM Favoritos WHERE id_perfil = ? AND id_contenido = ?',
                    [parseInt(id_perfil), parseInt(id_contenido)]
                );

                if (favorito.length === 0) {
                    // Agregar a Favoritos
                    await connection.execute(
                        'INSERT INTO Favoritos (id_perfil, id_contenido) VALUES (?, ?)',
                        [parseInt(id_perfil), parseInt(id_contenido)]
                    );
                }

                // Eliminar de Ver Luego
                await connection.execute(
                    'DELETE FROM VerLuego WHERE id_perfil = ? AND id_contenido = ?',
                    [parseInt(id_perfil), parseInt(id_contenido)]
                );

                return { movido: true };
            });

            res.status(200).json({
                success: true,
                message: 'Contenido movido a Favoritos exitosamente'
            });
        } catch (error) {
            console.error('Error moviendo a favoritos:', error);
            res.status(error.message === 'El contenido no está en Ver Luego' ? 404 : 500).json({
                success: false,
                error: error.message || 'Error al mover a Favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new VerLuegoController();