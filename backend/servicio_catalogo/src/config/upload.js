const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
const subDirs = ['posters', 'backdrops', 'trailers', 'temp'];

// Crear estructura de directorios
subDirs.forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar el subdirectorio basado en el tipo de archivo
    let subDir = 'temp';
    
    if (req.body.tipo_activo) {
      switch(req.body.tipo_activo) {
        case 'poster':
          subDir = 'posters';
          break;
        case 'backdrop':
          subDir = 'backdrops';
          break;
        case 'trailer':
          subDir = 'trailers';
          break;
      }
    }
    
    cb(null, path.join(uploadDir, subDir));
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos para imágenes
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  // Tipos MIME permitidos para videos (trailers)
  const allowedVideoTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];
  
  const isImage = allowedImageTypes.includes(file.mimetype);
  const isVideo = allowedVideoTypes.includes(file.mimetype);
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

module.exports = upload;