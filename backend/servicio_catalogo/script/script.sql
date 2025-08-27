CREATE DATABASE IF NOT EXISTS SA_PROJECT;
USE SA_PROJECT;

CREATE TABLE catalogo.Contenido (
    id_contenido        BIGINT IDENTITY(1,1) PRIMARY KEY,
    tipo                CHAR(1)        NOT NULL,      -- 'M' = película, 'S' = serie
    titulo              NVARCHAR(200)  NOT NULL,
    sinopsis            NVARCHAR(MAX)  NULL,
    anio_estreno        SMALLINT       NULL,
    clasificacion_edad  NVARCHAR(10)   NULL,
    duracion_minutos    INT            NULL,          -- solo películas
    popularidad         DECIMAL(9,4)   NOT NULL CONSTRAINT DF_Contenido_pop DEFAULT(0),
    activo              BIT            NOT NULL CONSTRAINT DF_Contenido_activo DEFAULT(1),
    fecha_creacion      DATETIME2(0)   NOT NULL CONSTRAINT DF_Contenido_creado DEFAULT(SYSDATETIME()),
    fecha_actualizacion DATETIME2(0)   NOT NULL CONSTRAINT DF_Contenido_actual DEFAULT(SYSDATETIME()),
    CONSTRAINT CK_Contenido_tipo CHECK (tipo IN ('M','S'))
);
CREATE INDEX IX_Contenido_tipo_pop ON catalogo.Contenido(tipo, popularidad DESC);
CREATE INDEX IX_Contenido_activo   ON catalogo.Contenido(activo);
GO

CREATE OR ALTER TRIGGER trg_Contenido_touch
ON catalogo.Contenido
AFTER UPDATE
AS
BEGIN
  IF (ROWCOUNT_BIG() = 0) RETURN;
  UPDATE c SET fecha_actualizacion = SYSDATETIME()
  FROM catalogo.Contenido c
  JOIN inserted i ON i.id_contenido = c.id_contenido;
END;
GO

CREATE TABLE catalogo.Series (
    id_serie          BIGINT PRIMARY KEY,  -- = id_contenido
    temporadas_totales INT NULL,
    CONSTRAINT FK_Series_contenido FOREIGN KEY (id_serie)
        REFERENCES catalogo.Contenido(id_contenido)
);
GO

CREATE TABLE catalogo.Temporadas (
    id_temporada     BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_serie         BIGINT        NOT NULL,
    numero_temporada INT           NOT NULL,
    titulo           NVARCHAR(200) NULL,
    CONSTRAINT UQ_Temporadas_serie_num UNIQUE (id_serie, numero_temporada),
    CONSTRAINT FK_Temporadas_serie FOREIGN KEY (id_serie)
        REFERENCES catalogo.Series(id_serie)
);
GO

CREATE TABLE catalogo.Episodios (
    id_episodio      BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_temporada     BIGINT        NOT NULL,
    numero_episodio  INT           NOT NULL,
    titulo           NVARCHAR(200) NOT NULL,
    sinopsis         NVARCHAR(MAX) NULL,
    duracion_minutos INT           NULL,
    fecha_emision    DATE          NULL,
    CONSTRAINT UQ_Episodios_temp_num UNIQUE (id_temporada, numero_episodio),
    CONSTRAINT FK_Episodios_temporada FOREIGN KEY (id_temporada)
        REFERENCES catalogo.Temporadas(id_temporada)
);
GO

CREATE TABLE catalogo.Generos (
    id_genero        INT IDENTITY(1,1) PRIMARY KEY,
    nombre           NVARCHAR(80) NOT NULL
);
GO

CREATE TABLE catalogo.ContenidoGeneros (
    id_contenido BIGINT NOT NULL,
    id_genero    INT    NOT NULL,
    CONSTRAINT PK_ContenidoGeneros PRIMARY KEY (id_contenido, id_genero),
    CONSTRAINT FK_ContGen_contenido FOREIGN KEY (id_contenido) REFERENCES catalogo.Contenido(id_contenido),
    CONSTRAINT FK_ContGen_genero    FOREIGN KEY (id_genero)    REFERENCES catalogo.Generos(id_genero)
);
GO

CREATE TABLE catalogo.Activos (
    id_activo    BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_contenido BIGINT        NOT NULL,
    tipo_activo  NVARCHAR(20)  NOT NULL,  -- 'poster','backdrop','trailer','manifest'
    url          NVARCHAR(500) NOT NULL,
    idioma       NVARCHAR(10)  NULL,
    fecha_creacion DATETIME2(0) NOT NULL CONSTRAINT DF_Activos_creado DEFAULT(SYSDATETIME()),
    CONSTRAINT FK_Activos_contenido FOREIGN KEY (id_contenido)
        REFERENCES catalogo.Contenido(id_contenido)
);
CREATE INDEX IX_Activos_contenido_tipo ON catalogo.Activos(id_contenido, tipo_activo);
GO

-- Modificar la tabla de Activos para almacenar rutas locales
ALTER TABLE catalogo.Activos 
ADD ruta_local NVARCHAR(500) NULL;

ALTER TABLE catalogo.Activos
ADD tamanio_bytes BIGINT NULL;

ALTER TABLE catalogo.Activos
ADD mime_type NVARCHAR(100) NULL;

-- Crear índice para búsquedas por tipo MIME
CREATE INDEX IX_Activos_mime_type ON catalogo.Activos(mime_type);
