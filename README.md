# Sistema Chapinflix

## Descripción del Proyecto

Chapinflix es una plataforma de streaming de video que permite a los usuarios visualizar contenido multimedia organizado por categorías. El sistema incluye funcionalidades de gestión de usuarios, catálogo de contenido, listas personalizadas y panel administrativo.

## Tabla de Contenidos

- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Requerimientos No Funcionales](#requerimientos-no-funcionales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [Casos de Uso](#casos-de-uso)
- [Diagramas de Secuencia](#diagramas-de-secuencia)
- [Metodología de Desarrollo](#metodología-de-desarrollo)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)

## Requerimientos Funcionales

### RF01 - Gestión de Usuarios
- **RF01.1**: El sistema debe permitir el registro de nuevos usuarios con campos obligatorios
- **RF01.2**: El sistema debe enviar un correo de confirmación con caducidad de 2 minutos
- **RF01.3**: El sistema debe permitir el login con username/correo y contraseña
- **RF01.4**: El sistema debe permitir la edición de datos del perfil
- **RF01.5**: El sistema debe soportar hasta 5 perfiles por cuenta de usuario
- **RF01.6**: El sistema debe manejar dos categorías: usuario gratuito y suscripción mensual

### RF02 - Control Administrativo
- **RF02.1**: El administrador debe poder activar/desactivar cuentas de usuarios
- **RF02.2**: El administrador debe poder crear cuentas manualmente
- **RF02.3**: El administrador debe poder gestionar promociones y descuentos
- **RF02.4**: El administrador debe poder dar seguimiento a usuarios reportados
- **RF02.5**: El sistema debe tener un login separado para administradores

### RF03 - Gestión de Contenido
- **RF03.1**: El sistema debe permitir la carga individual y masiva de contenido
- **RF03.2**: El sistema debe permitir gestionar la disponibilidad del contenido por fechas
- **RF03.3**: El sistema debe diferenciar contenido para usuarios gratuitos y premium
- **RF03.4**: El sistema debe almacenar metadata del contenido

### RF04 - Catálogo y Navegación
- **RF04.1**: El sistema debe mostrar películas por categorías y subcategorías
- **RF04.2**: El sistema debe implementar visualización por carruseles
- **RF04.3**: El sistema debe mostrar secciones especiales (Vistos recientemente, Más populares, Top 15, etc.)
- **RF04.4**: El sistema debe mostrar recomendaciones en el encabezado con preview

### RF05 - Visualización de Contenido
- **RF05.1**: El sistema debe mostrar página de detalles con sinopsis completa
- **RF05.2**: El sistema debe mostrar imágenes previas de la película
- **RF05.3**: El sistema debe mostrar información relacionada (estudio, duración, clasificación)

### RF06 - Listas Personalizadas
- **RF06.1**: Los usuarios deben poder agregar películas a "Mis Favoritos"
- **RF06.2**: Los usuarios deben poder agregar películas a "Ver luego"
- **RF06.3**: Los usuarios deben poder eliminar elementos de sus listas
- **RF06.4**: El sistema debe mostrar estas listas como carruseles en la página principal

## Requerimientos No Funcionales

### RNF01 - Rendimiento
- **RNF01.1**: El tiempo de carga de la página principal no debe exceder 3 segundos
- **RNF01.2**: El sistema debe soportar al menos 100 usuarios concurrentes

### RNF02 - Seguridad
- **RNF02.1**: Las contraseñas deben almacenarse encriptadas
- **RNF02.2**: El token de confirmación de email debe expirar en 2 minutos
- **RNF02.3**: Las sesiones deben manejarse con JWT o similar
- **RNF02.4**: Debe implementarse HTTPS en todas las comunicaciones

### RNF03 - Usabilidad
- **RNF03.1**: El sitio debe ser responsive
- **RNF03.2**: La interfaz debe ser intuitiva y amigable
- **RNF03.3**: Los mensajes de error deben ser claros y orientativos

### RNF04 - Escalabilidad
- **RNF04.1**: Debe poder escalar horizontalmente
- **RNF04.2**: Las bases de datos deben estar separadas por dominio
- **RNF04.3**: El sistema debe soportar crecimiento gradual de usuarios
- **RNF04.4**: Los contenedores deben poder replicarse según demanda

### RNF05 - Disponibilidad
- **RNF05.1**: El sistema debe tener una disponibilidad del 99%
- **RNF05.2**: Debe implementarse manejo de errores y recuperación

## Casos de Uso

### Casos de Uso de Alto Nivel

![Caso de uso de alto nivel](./Documentacion/img/alto_nivel.png)

### Casos de uso detallados
![Caso de uso Detallado. RF01](./Documentacion/img/detallado_1.png)
![Caso de uso Detallado. RF02](./Documentacion/img/detallado_2.png)
![Caso de uso Detallado. RF03](./Documentacion/img/detallado_3.png)
![Caso de uso Detallado. RF04](./Documentacion/img/detallado_4.png)
![Caso de uso Detallado. RF05](./Documentacion/img/detallado_5.png)
![Caso de uso Detallado. RF06](./Documentacion/img/detallado_6.png)

## Diagrama de Alto Nivel

![Diagrama de Bloques](./Documentacion/img/diagramaBloques.png)

## Arquitectura del Sistema

### Diagrama de Arquitectura


![Diagrama de Arquitectura](./Documentacion/img/arquitectura.png)

## Modelo de Datos

### Base de Datos de Catálogo

```mermaid
erDiagram
    SERIES ||--o{ TEMPORADAS : contiene
    TEMPORADAS ||--o{ EPISODIOS : tiene
    SERIES ||--o{ CONTENIDOGENEROS : clasifica
    CONTENIDO ||--o{ CONTENIDOGENEROS : clasifica
    GENEROS ||--o{ CONTENIDOGENEROS : categoriza
    CONTENIDO ||--o{ ACTIVOS : almacena
    
    SERIES {
        int id_serie PK
        string titulo
        int temporadas_totales
    }
    
    TEMPORADAS {
        int id_temporada PK
        int id_serie FK
        int numero_temporada
        string titulo
    }
    
    EPISODIOS {
        int id_episodio PK
        int id_temporada FK
        int numero_episodio
        string titulo
        text sinopsis
        int duracion_minutos
        date fecha_emision
    }
    
    CONTENIDO {
        int id_contenido PK
        string tipo
        string titulo
        text sinopsis
        int ano_estreno
        string clasificacion_edad
        int duracion_minutos
        int popularidad
        boolean activo
        datetime fecha_creacion
        datetime fecha_actualizacion
    }
    
    GENEROS {
        int id_genero PK
        string nombre
    }
    
    CONTENIDOGENEROS {
        int id_contenido FK
        int id_genero FK
    }
    
    ACTIVOS {
        int id_activo PK
        int id_contenido FK
        string tipo_activo
        string url
        string idioma
        datetime fecha_creacion
    }
```

### Base de Datos de Autenticación

```mermaid
erDiagram
    USUARIOS ||--o{ USUARIOROLES : tiene
    ROLES ||--o{ USUARIOROLES : asigna
    USUARIOS ||--o{ DIRECCIONESUSUARIOS : reside
    
    USUARIOS {
        int id_usuario PK
        string nombre
        string apellido
        string correo_electronico
        string nombre_usuario
        string telefono
        datetime fecha_nacimiento
        string sexo
        string imagen_perfil_url
        string estado
        boolean correo_verificado
        string contrasena_hash
        datetime fecha_creacion
        datetime fecha_actualizacion
    }
    
    ROLES {
        int id_rol PK
        string nombre
    }
    
    USUARIOROLES {
        int id_usuario FK
        int id_rol FK
    }
    
    DIRECCIONESUSUARIOS {
        int id_direccion PK
        int id_usuario FK
        string pais
        string linea1
        string linea2
        string ciudad
        string departamento
        string codigo_postal
        boolean es_predeterminada
        datetime fecha_creacion
    }
```

### Base de datos de interaccion
```mermaid
erDiagram
    
    VerLuego {
        int id_pefil PK
        int id_contenido
        datetime agregado_en
    }
    
    ProgresoVisualizacion {
        int id_perfil PK
        int id_contenido
        int token

    }
    
    Favoritos {
        int id_usuario FK
        int id_rol FK
    }
```

### Base de datos de Series

``` mermaid
erDiagram
    CONTENIDO ||--o{ SERIES : "tiene"
    SERIES ||--o{ TEMPORADAS : "tiene"
    CONTENIDO ||--o{ ACTIVOS : "almacena"
    TEMPORADAS ||--o{ EPISODIOS : "contiene"
    CONTENIDO ||--o{ CONTENIDOGENEROS : "clasifica"
    GENEROS ||--o{ CONTENIDOGENEROS : "categoriza"

    TEMPORADAS {
        int id_temporada PK
        int id_serie FK
        int numero_temporada
        string titulo
    }

    SERIES {
        int id_serie PK
        int temporadas_totales
    }

    EPISODIOS {
        int id_episodio PK
        int id_temporada FK
        int numero_episodio
        string titulo
        text sinopsis
        int duracion_minutos
        date fecha_emision
    }

    CONTENIDO {
        int id_contenido PK
        string tipo
        string titulo
        text sinopsis
        int ano_estreno
        string clasificacion_edad
        int duracion_minutos
        int popularidad
        boolean activo
        datetime fecha_creacion
        datetime fecha_actualizacion
    }


    CONTENIDOGENEROS {
        int id_contenido FK
        int id_genero FK
    }
    GENEROS {
        int id_genero PK
        string nombre
    }

    ACTIVOS {
        int id_activo PK
        int id_contenido FK
        string tipo_activo
        string url
        string idioma
        datetime fecha_creacion
    }
```

## Metodología a utilizar
Como Grupo #2 decidimos utilizar una metodología Scrum+Kanban donde tomamos los sprint de Scrum y el tablero de Kanban para poder visualizar las tareas asignadas a cada integrante del grupo y el avance de las mismas, de esta manera podemos tener pequeñas reuniones diarias entre el grupo para exponer nuestro avances o bloqueos al realizar el proyecto.

#### Tablero al inicio del sprint
![Tablero Kanban Inicio](./Documentacion/img/kanban_inicio.png)


#### Tablero al durante del sprint
![Tablero Kanban medio](./Documentacion/img/kangan_durante.png)

#### Tablero al finalizar el sprint
![Tablero Kanban fin](./Documentacion/img/kanban_fin.png)

### Reunion de Sprint Planning
Se realizó la reunión inicial para definir el backlog de las funcionalidades importantes del sistemas así como la asignación de las tareas al equipo de desarrollo.

### Reuniones de Daily
Reuniones para conocer y compartir con los demás miembros del equipo los avances que se van teniendo en el proyecto.

### Reunión de Sprint Retrospective
Reunión final para evaluar y obtener retroalimentación sobre la manera en que se implementó el sprint para poder realizar mejoras en sprint futuros.



## Diagramas de Secuencia

### Registro y Login de Usuario

```mermaid
sequenceDiagram
    participant U as Usuario
    participant MR as Módulo de Registro
    participant BD as Base de Datos
    participant L as Login
    
    U->>MR: Llenar formulario con datos solicitados
    MR->>MR: Validar datos
    MR->>BD: Agregar usuario
    BD-->>MR: Éxito en registro
    MR->>MR: Enviar correo de verificación
    MR-->>U: Mostrar en pantalla - revisar correo
    U->>U: Presionar link de verificación
    U->>L: Ingresar usuario y contraseña
    L->>BD: Verificar si existe usuario y validó correo
    BD-->>L: Mensaje: bienvenido a chapinflix
```

### Consulta de Catálogo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant PI as Página Inicio
    participant DBC as DB Catálogo
    
    U->>PI: Navegar a chapinflix
    PI->>DBC: Consultar catálogo disponible
    DBC-->>PI: JSON con detalles de películas
    PI-->>U: Muestra carrusel de películas
    U->>PI: Click para ver detalles
    PI->>DBC: Envía ID de película para obtener datos
    DBC->>DBC: Revisa si el ID de película existe
    DBC-->>PI: Devuelve los datos en JSON
    PI-->>U: Muestra detalles de la película
```
