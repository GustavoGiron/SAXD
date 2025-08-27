-- Script de creación de base de datos para MySQL
CREATE DATABASE IF NOT EXISTS SA_PROJECT;
USE SA_PROJECT;

-- Crear esquema catalogo (en MySQL usamos prefijo en las tablas)
-- Tabla de Contenido
CREATE TABLE IF NOT EXISTS catalogo_contenido (
    id_contenido        BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo                CHAR(1)        NOT NULL,      -- 'M' = película, 'S' = serie
    titulo              VARCHAR(200)   NOT NULL,
    sinopsis            TEXT           NULL,
    anio_estreno        SMALLINT       NULL,
    clasificacion_edad  VARCHAR(10)    NULL,
    duracion_minutos    INT            NULL,          -- solo películas
    popularidad         DECIMAL(9,4)   NOT NULL DEFAULT 0,
    activo              BOOLEAN        NOT NULL DEFAULT TRUE,
    fecha_creacion      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_contenido_tipo CHECK (tipo IN ('M','S')),
    INDEX IX_contenido_tipo_pop (tipo, popularidad DESC),
    INDEX IX_contenido_activo (activo)
);

-- Trigger para actualizar fecha_actualizacion
DELIMITER $$
CREATE TRIGGER trg_contenido_touch
BEFORE UPDATE ON catalogo_contenido
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Tabla de Series
CREATE TABLE IF NOT EXISTS catalogo_series (
    id_serie          BIGINT PRIMARY KEY,  -- = id_contenido
    temporadas_totales INT NULL,
    CONSTRAINT FK_series_contenido FOREIGN KEY (id_serie)
        REFERENCES catalogo_contenido(id_contenido)
        ON DELETE CASCADE
);

-- Tabla de Temporadas
CREATE TABLE IF NOT EXISTS catalogo_temporadas (
    id_temporada     BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_serie         BIGINT        NOT NULL,
    numero_temporada INT           NOT NULL,
    titulo           VARCHAR(200)  NULL,
    UNIQUE KEY UQ_temporadas_serie_num (id_serie, numero_temporada),
    CONSTRAINT FK_temporadas_serie FOREIGN KEY (id_serie)
        REFERENCES catalogo_series(id_serie)
        ON DELETE CASCADE
);

-- Tabla de Episodios
CREATE TABLE IF NOT EXISTS catalogo_episodios (
    id_episodio      BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_temporada     BIGINT        NOT NULL,
    numero_episodio  INT           NOT NULL,
    titulo           VARCHAR(200)  NOT NULL,
    sinopsis         TEXT          NULL,
    duracion_minutos INT           NULL,
    fecha_emision    DATE          NULL,
    UNIQUE KEY UQ_episodios_temp_num (id_temporada, numero_episodio),
    CONSTRAINT FK_episodios_temporada FOREIGN KEY (id_temporada)
        REFERENCES catalogo_temporadas(id_temporada)
        ON DELETE CASCADE
);

-- Tabla de Géneros
CREATE TABLE IF NOT EXISTS catalogo_generos (
    id_genero        INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(80) NOT NULL
);

-- Tabla de relación Contenido-Géneros
CREATE TABLE IF NOT EXISTS catalogo_contenido_generos (
    id_contenido BIGINT NOT NULL,
    id_genero    INT    NOT NULL,
    PRIMARY KEY (id_contenido, id_genero),
    CONSTRAINT FK_contgen_contenido FOREIGN KEY (id_contenido) 
        REFERENCES catalogo_contenido(id_contenido)
        ON DELETE CASCADE,
    CONSTRAINT FK_contgen_genero FOREIGN KEY (id_genero) 
        REFERENCES catalogo_generos(id_genero)
        ON DELETE CASCADE
);

-- Tabla de Activos (recursos multimedia)
CREATE TABLE IF NOT EXISTS catalogo_activos (
    id_activo    BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_contenido BIGINT        NOT NULL,
    tipo_activo  VARCHAR(20)   NOT NULL,  -- 'poster','backdrop','trailer','manifest'
    url          VARCHAR(500)  NOT NULL,
    ruta_local   VARCHAR(500)  NULL,
    idioma       VARCHAR(10)   NULL,
    tamanio_bytes BIGINT       NULL,
    mime_type    VARCHAR(100)  NULL,
    fecha_creacion DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_activos_contenido FOREIGN KEY (id_contenido)
        REFERENCES catalogo_contenido(id_contenido)
        ON DELETE CASCADE,
    INDEX IX_activos_contenido_tipo (id_contenido, tipo_activo),
    INDEX IX_activos_mime_type (mime_type)
);

-- Insertar datos de ejemplo para géneros
INSERT INTO catalogo_generos (nombre) VALUES 
('Acción'),
('Aventura'),
('Animación'),
('Comedia'),
('Crimen'),
('Documental'),
('Drama'),
('Familia'),
('Fantasía'),
('Historia'),
('Horror'),
('Música'),
('Misterio'),
('Romance'),
('Ciencia Ficción'),
('Película de TV'),
('Thriller'),
('Guerra'),
('Western'),
('Biografía'),
('Musical'),
('Deporte'),
('Suspenso');

-- Insertar datos de ejemplo para contenido
INSERT INTO catalogo_contenido (tipo, titulo, sinopsis, anio_estreno, clasificacion_edad, duracion_minutos, popularidad) VALUES
('M', 'El Cadejo', 'Una película de horror basada en la leyenda guatemalteca del Cadejo, un espíritu que protege a los viajeros.', 2023, 'PG-13', 95, 8.5),
('M', 'La Llorona', 'Durante el conflicto armado en Guatemala, un general retirado es atormentado por el espíritu de La Llorona.', 2019, 'R', 97, 9.2),
('S', 'Chapines Abroad', 'Serie que sigue las aventuras de guatemaltecos viviendo en diferentes partes del mundo.', 2024, 'TV-14', NULL, 7.8),
('M', 'Ixcanul', 'María, una joven maya, enfrenta un matrimonio arreglado mientras lidia con sus propios deseos.', 2015, 'PG-13', 93, 8.8);

-- Insertar relaciones de géneros
INSERT INTO catalogo_contenido_generos (id_contenido, id_genero) VALUES
(1, 11), -- El Cadejo - Horror
(1, 13), -- El Cadejo - Misterio
(2, 11), -- La Llorona - Horror
(2, 7),  -- La Llorona - Drama
(3, 4),  -- Chapines Abroad - Comedia
(3, 7),  -- Chapines Abroad - Drama
(4, 7);  -- Ixcanul - Drama