# Dockerfile para backend/servicio_catalogo
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorios necesarios para uploads
RUN mkdir -p uploads/posters uploads/backdrops uploads/trailers uploads/temp

# Exponer puerto
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]