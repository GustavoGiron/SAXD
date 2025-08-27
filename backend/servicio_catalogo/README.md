# 🎬 Chapinflix API Documentation

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Autenticación](#autenticación)
5. [Microservicios](#microservicios)
6. [API Reference](#api-reference)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Códigos de Estado](#códigos-de-estado)
9. [Rate Limiting](#rate-limiting)
10. [Troubleshooting](#troubleshooting)

## Descripción General

Chapinflix es una plataforma de streaming desarrollada con arquitectura de microservicios. Esta documentación cubre todos los endpoints disponibles y cómo consumirlos.

### Características Principales
- ✅ Arquitectura de microservicios
- ✅ API Gateway con NGINX
- ✅ Autenticación JWT
- ✅ Rate limiting
- ✅ Caché inteligente
- ✅ Carga de archivos multimedia
- ✅ Documentación Swagger


## Instalación y Configuración

### Requisitos Previos
- Docker y Docker Compose
- Node.js 18+
- SQL Server 2019+
- Redis (opcional)

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/chapinflix/backend.git
cd backend

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Levantar todos los servicios
docker-compose up -d

# Verificar estado
curl http://localhost/health
```

### Instalación Manual

#### 1. Base de Datos
```bash
# Ejecutar script SQL
sqlcmd -S localhost -U sa -P YourPassword123! -i scripts/database-setup.sql
```

#### 2. Microservicio de Catálogo
```bash
cd servicio_catalogo
npm install
npm run setup:dirs
npm run dev
```

#### 3. API Gateway
```bash
cd nginx
docker build -t chapinflix-gateway .
docker run -p 80:80 chapinflix-gateway
```


## Microservicios

### 📚 Microservicio de Catálogo

Gestiona todo el contenido multimedia de la plataforma.

**Base URL**: `/api/catalog`

## API Reference

### 📖 Contenido

#### Listar Todo el Contenido
```http
GET /api/catalog/content
```

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| tipo | string | Tipo de contenido (M=Película, S=Serie) | `M` |
| genero | integer | ID del género | `5` |
| anio | integer | Año de estreno | `2024` |
| orderBy | string | Ordenamiento (popularity, recent) | `popularity` |
| limit | integer | Cantidad de resultados (máx: 100) | `20` |
| offset | integer | Offset para paginación | `0` |

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_contenido": 1,
      "tipo": "M",
      "titulo": "El Cadejo",
      "sinopsis": "Una película de horror...",
      "anio_estreno": 2023,
      "clasificacion_edad": "PG-13",
      "duracion_minutos": 95,
      "popularidad": 8.5,
      "generos": "Horror, Misterio"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

#### Obtener Contenido por ID
```http
GET /api/catalog/content/{id}
```

**Parámetros de Ruta:**
- `id` (integer, required): ID del contenido

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_contenido": 1,
    "tipo": "M",
    "titulo": "El Cadejo",
    "sinopsis": "Una película de horror basada en la leyenda guatemalteca...",
    "anio_estreno": 2023,
    "clasificacion_edad": "PG-13",
    "duracion_minutos": 95,
    "popularidad": 8.5,
    "activo": true,
    "fecha_creacion": "2024-01-15T10:30:00",
    "fecha_actualizacion": "2024-01-20T15:45:00",
    "generos": "Horror, Misterio"
  }
}
```

#### Contenido Popular
```http
GET /api/catalog/content/popular
```

**Query Parameters:**
- `limit` (integer, optional): Cantidad de resultados (default: 15)

#### Contenido Reciente
```http
GET /api/catalog/content/recent
```

**Query Parameters:**
- `limit` (integer, optional): Cantidad de resultados (default: 20)

#### Crear Contenido (Admin)
```http
POST /api/catalog/content
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo": "M",
  "titulo": "Nueva Película",
  "sinopsis": "Descripción de la película",
  "anio_estreno": 2024,
  "clasificacion_edad": "PG-13",
  "duracion_minutos": 120,
  "popularidad": 7.5,
  "generos": [1, 5, 8]
}
```

#### Crear Contenido con Imágenes (Admin)
```http
POST /api/catalog/content/with-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- tipo: M
- titulo: Nueva Película
- sinopsis: Descripción
- anio_estreno: 2024
- clasificacion_edad: PG-13
- duracion_minutos: 120
- popularidad: 7.5
- generos: [1, 5, 8]
- images: (archivos)
- tipo_activo: poster
```

#### Actualizar Contenido (Admin)
```http
PUT /api/catalog/content/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Título Actualizado",
  "popularidad": 8.0
}
```

#### Eliminar Contenido (Admin)
```http
DELETE /api/catalog/content/{id}
Authorization: Bearer {token}
```

#### Agregar Imagen a Contenido (Admin)
```http
POST /api/catalog/content/{id}/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- image: (archivo)
- tipo_activo: poster
- idioma: es
```

### 🎭 Géneros

#### Listar Géneros
```http
GET /api/catalog/genres
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_genero": 1,
      "nombre": "Acción"
    },
    {
      "id_genero": 2,
      "nombre": "Aventura"
    }
  ]
}
```

#### Crear Género (Admin)
```http
POST /api/catalog/genres
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Nuevo Género"
}
```

### 📺 Series

#### Obtener Temporadas de una Serie
```http
GET /api/catalog/series/{id}/seasons
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_temporada": 1,
      "numero_temporada": 1,
      "titulo": "Primera Temporada"
    }
  ]
}
```

#### Obtener Episodios de una Temporada
```http
GET /api/catalog/series/{id}/seasons/{seasonId}/episodes
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_episodio": 1,
      "numero_episodio": 1,
      "titulo": "Episodio Piloto",
      "sinopsis": "El primer episodio...",
      "duracion_minutos": 45,
      "fecha_emision": "2024-01-15"
    }
  ]
}
```

#### Crear Temporada (Admin)
```http
POST /api/catalog/series/{id}/seasons
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_temporada": 1,
  "titulo": "Primera Temporada"
}
```

#### Crear Episodio (Admin)
```http
POST /api/catalog/series/{id}/seasons/{seasonId}/episodes
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_episodio": 1,
  "titulo": "Episodio Piloto",
  "sinopsis": "Descripción del episodio",
  "duracion_minutos": 45,
  "fecha_emision": "2024-01-15"
}
```

### 🖼️ Activos (Imágenes/Videos)

#### Obtener Activos de Contenido
```http
GET /api/catalog/assets/content/{contentId}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_activo": 1,
      "tipo_activo": "poster",
      "url": "/uploads/posters/image.jpg",
      "idioma": "es",
      "tamanio_bytes": 245632,
      "mime_type": "image/jpeg"
    }
  ]
}
```

#### Obtener Imagen Específica
```http
GET /api/catalog/content/{contentId}/image/{filename}
```

Devuelve el archivo de imagen directamente.

## Ejemplos de Uso

### JavaScript/Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
});

// Obtener películas populares
const getPopularMovies = async () => {
  try {
    const response = await api.get('/catalog/content/popular?limit=10');
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Crear nueva película con imagen
const createMovieWithImage = async (movieData, imageFile) => {
  const formData = new FormData();
  Object.keys(movieData).forEach(key => {
    formData.append(key, movieData[key]);
  });
  formData.append('images', imageFile);
  
  try {
    const response = await api.post('/catalog/content/with-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### cURL
```bash
# Obtener contenido
curl -X GET "http://localhost/api/catalog/content" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear contenido
curl -X POST "http://localhost/api/catalog/content" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "M",
    "titulo": "Nueva Película",
    "sinopsis": "Descripción",
    "anio_estreno": 2024,
    "duracion_minutos": 120
  }'

# Subir imagen
curl -X POST "http://localhost/api/catalog/content/1/image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@poster.jpg" \
  -F "tipo_activo=poster"
```

### Python
```python
import requests

base_url = "http://localhost/api"
headers = {"Authorization": "Bearer YOUR_TOKEN"}

# Obtener contenido popular
response = requests.get(f"{base_url}/catalog/content/popular", headers=headers)
movies = response.json()["data"]

# Crear contenido con imagen
files = {"images": open("poster.jpg", "rb")}
data = {
    "tipo": "M",
    "titulo": "Nueva Película",
    "sinopsis": "Descripción",
    "anio_estreno": 2024,
    "duracion_minutos": 120
}
response = requests.post(
    f"{base_url}/catalog/content/with-images",
    headers=headers,
    data=data,
    files=files
)
```

## Códigos de Estado

| Código | Descripción | Situación |
|--------|-------------|-----------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Petición exitosa sin contenido |
| 400 | Bad Request | Error en la petición |
| 401 | Unauthorized | Token inválido o faltante |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |
| 503 | Service Unavailable | Servicio no disponible |
