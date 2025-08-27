-- ============================================================
-- BASE DE DATOS: DB_interaccion
-- Microservicio de Interacción - Chapinflix
-- Compatible con MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS DB_interaccion;
USE DB_interaccion;

-- ============================================================
-- TABLA: Favoritos
-- Almacena las películas marcadas como favoritas por perfil
-- ============================================================
DROP TABLE IF EXISTS Favoritos;
CREATE TABLE Favoritos (
    id_perfil       BIGINT NOT NULL,
    id_contenido    BIGINT NOT NULL,
    agregado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_perfil, id_contenido),
    INDEX IX_Favoritos_perfil (id_perfil),
    INDEX IX_Favoritos_contenido (id_contenido),
    INDEX IX_Favoritos_fecha (agregado_en DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: VerLuego  
-- Almacena las películas marcadas para ver después por perfil
-- ============================================================
DROP TABLE IF EXISTS VerLuego;
CREATE TABLE VerLuego (
    id_perfil       BIGINT NOT NULL,
    id_contenido    BIGINT NOT NULL,
    agregado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_perfil, id_contenido),
    INDEX IX_VerLuego_perfil (id_perfil),
    INDEX IX_VerLuego_contenido (id_contenido),
    INDEX IX_VerLuego_fecha (agregado_en DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: ProgresoVisualizacion
-- Almacena el progreso de visualización de contenido
-- ============================================================
DROP TABLE IF EXISTS ProgresoVisualizacion;
CREATE TABLE ProgresoVisualizacion (
    id_perfil           BIGINT NOT NULL,
    id_contenido        BIGINT NOT NULL,
    id_episodio         BIGINT NULL,        -- NULL para películas
    id_episodio_pk      VARCHAR(20) GENERATED ALWAYS AS (IFNULL(CAST(id_episodio AS CHAR), '0')) STORED,
    posicion_segundos   INT NOT NULL DEFAULT 0,
    duracion_segundos   INT NULL,
    ultima_vez_visto    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_perfil, id_contenido, id_episodio_pk),
    INDEX IX_Progreso_perfil_ultima (id_perfil, ultima_vez_visto DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROCEDIMIENTOS ALMACENADOS (OPCIONAL)
-- ============================================================

DELIMITER $$

-- Procedimiento para agregar a favoritos con validación
DROP PROCEDURE IF EXISTS sp_AgregarFavorito$$
CREATE PROCEDURE sp_AgregarFavorito(
    IN p_id_perfil BIGINT,
    IN p_id_contenido BIGINT
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;
    
    -- Verificar si ya existe
    SELECT COUNT(*) INTO v_existe 
    FROM Favoritos 
    WHERE id_perfil = p_id_perfil 
    AND id_contenido = p_id_contenido;
    
    IF v_existe > 0 THEN
        SELECT 'El contenido ya está en favoritos' AS mensaje, 0 AS exito;
    ELSE
        INSERT INTO Favoritos (id_perfil, id_contenido) 
        VALUES (p_id_perfil, p_id_contenido);
        SELECT 'Agregado a favoritos exitosamente' AS mensaje, 1 AS exito;
    END IF;
END$$

-- Procedimiento para agregar a ver luego con validación
DROP PROCEDURE IF EXISTS sp_AgregarVerLuego$$
CREATE PROCEDURE sp_AgregarVerLuego(
    IN p_id_perfil BIGINT,
    IN p_id_contenido BIGINT
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;
    
    -- Verificar si ya existe
    SELECT COUNT(*) INTO v_existe 
    FROM VerLuego 
    WHERE id_perfil = p_id_perfil 
    AND id_contenido = p_id_contenido;
    
    IF v_existe > 0 THEN
        SELECT 'El contenido ya está en ver luego' AS mensaje, 0 AS exito;
    ELSE
        INSERT INTO VerLuego (id_perfil, id_contenido) 
        VALUES (p_id_perfil, p_id_contenido);
        SELECT 'Agregado a ver luego exitosamente' AS mensaje, 1 AS exito;
    END IF;
END$$

-- Procedimiento para obtener listas combinadas de un perfil
DROP PROCEDURE IF EXISTS sp_ObtenerListasUsuario$$
CREATE PROCEDURE sp_ObtenerListasUsuario(
    IN p_id_perfil BIGINT
)
BEGIN
    -- Favoritos
    SELECT 
        'favoritos' AS lista,
        id_contenido,
        agregado_en
    FROM Favoritos 
    WHERE id_perfil = p_id_perfil
    
    UNION ALL
    
    -- Ver Luego
    SELECT 
        'ver_luego' AS lista,
        id_contenido,
        agregado_en
    FROM VerLuego 
    WHERE id_perfil = p_id_perfil
    
    ORDER BY agregado_en DESC;
END$$

-- Procedimiento para mover de Ver Luego a Favoritos
DROP PROCEDURE IF EXISTS sp_MoverAFavoritos$$
CREATE PROCEDURE sp_MoverAFavoritos(
    IN p_id_perfil BIGINT,
    IN p_id_contenido BIGINT
)
BEGIN
    DECLARE v_existe_verluego INT DEFAULT 0;
    DECLARE v_existe_favorito INT DEFAULT 0;
    
    -- Verificar si existe en Ver Luego
    SELECT COUNT(*) INTO v_existe_verluego 
    FROM VerLuego 
    WHERE id_perfil = p_id_perfil 
    AND id_contenido = p_id_contenido;
    
    IF v_existe_verluego = 0 THEN
        SELECT 'El contenido no está en Ver Luego' AS mensaje, 0 AS exito;
    ELSE
        -- Verificar si ya está en Favoritos
        SELECT COUNT(*) INTO v_existe_favorito 
        FROM Favoritos 
        WHERE id_perfil = p_id_perfil 
        AND id_contenido = p_id_contenido;
        
        -- Si no está en favoritos, agregarlo
        IF v_existe_favorito = 0 THEN
            INSERT INTO Favoritos (id_perfil, id_contenido) 
            VALUES (p_id_perfil, p_id_contenido);
        END IF;
        
        -- Eliminar de Ver Luego
        DELETE FROM VerLuego 
        WHERE id_perfil = p_id_perfil 
        AND id_contenido = p_id_contenido;
        
        SELECT 'Movido a favoritos exitosamente' AS mensaje, 1 AS exito;
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

-- Insertar datos de prueba para favoritos
INSERT INTO Favoritos (id_perfil, id_contenido, agregado_en) VALUES
(1, 101, '2024-01-15 10:30:00'),
(1, 102, '2024-01-16 14:20:00'),
(1, 105, '2024-01-17 09:15:00'),
(2, 101, '2024-01-15 11:00:00'),
(2, 103, '2024-01-18 16:45:00')
ON DUPLICATE KEY UPDATE agregado_en = VALUES(agregado_en);

-- Insertar datos de prueba para ver luego
INSERT INTO VerLuego (id_perfil, id_contenido, agregado_en) VALUES
(1, 103, '2024-01-15 12:00:00'),
(1, 104, '2024-01-16 15:30:00'),
(2, 102, '2024-01-17 10:20:00'),
(2, 105, '2024-01-18 18:00:00')
ON DUPLICATE KEY UPDATE agregado_en = VALUES(agregado_en);

-- Insertar datos de prueba para progreso de visualización
INSERT INTO ProgresoVisualizacion 
(id_perfil, id_contenido, id_episodio, posicion_segundos, duracion_segundos, ultima_vez_visto) VALUES
(1, 101, NULL, 1800, 7200, '2024-01-15 20:30:00'),
(1, 102, NULL, 3600, 6000, '2024-01-16 21:00:00'),
(2, 101, NULL, 900, 7200, '2024-01-17 19:45:00')
ON DUPLICATE KEY UPDATE 
    posicion_segundos = VALUES(posicion_segundos),
    ultima_vez_visto = VALUES(ultima_vez_visto);

-- ============================================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- ============================================================
SELECT 'Tablas creadas:' AS info;
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'DB_interaccion' 
AND TABLE_NAME IN ('Favoritos', 'VerLuego', 'ProgresoVisualizacion');

-- Contar registros de prueba
SELECT 'Datos de prueba insertados:' AS info;
SELECT 
    (SELECT COUNT(*) FROM Favoritos) AS total_favoritos,
    (SELECT COUNT(*) FROM VerLuego) AS total_ver_luego,
    (SELECT COUNT(*) FROM ProgresoVisualizacion) AS total_progreso;