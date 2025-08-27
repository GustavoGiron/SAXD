@echo off
REM Script de pruebas para Windows - Microservicio de Interaccion
echo ===============================================================
echo PRUEBAS DEL MICROSERVICIO DE INTERACCION - CHAPINFLIX
echo ===============================================================
echo.

REM Variables
set BASE_URL=http://localhost:3002
set API_URL=%BASE_URL%/api/v1

REM Colores (no funcionan en CMD básico, pero se ven los mensajes)
echo [TEST 1] Health Check
curl -s %BASE_URL%/health
echo.
echo.

echo [TEST 2] Informacion del Servicio
curl -s %BASE_URL%/info
echo.
echo.

echo =============== PRUEBAS DE FAVORITOS ===============
echo.

echo [TEST 3] Obtener favoritos del perfil 1
curl -s "%API_URL%/perfil/1/favoritos"
echo.
echo.

echo [TEST 4] Agregar contenido 999 a favoritos
curl -s -X POST "%API_URL%/perfil/1/favoritos" -H "Content-Type: application/json" -d "{\"id_contenido\": 999}"
echo.
echo.

echo [TEST 5] Verificar si contenido 999 esta en favoritos
curl -s "%API_URL%/perfil/1/favoritos/999/verificar"
echo.
echo.

echo [TEST 6] Intentar agregar duplicado (debe fallar)
curl -s -X POST "%API_URL%/perfil/1/favoritos" -H "Content-Type: application/json" -d "{\"id_contenido\": 999}"
echo.
echo.

echo [TEST 7] Agregar multiples favoritos (batch)
curl -s -X POST "%API_URL%/perfil/1/favoritos/batch" -H "Content-Type: application/json" -d "{\"contenidos\": [201, 202, 203, 999]}"
echo.
echo.

echo =============== PRUEBAS DE VER LUEGO ===============
echo.

echo [TEST 8] Obtener lista Ver Luego del perfil 1
curl -s "%API_URL%/perfil/1/verluego"
echo.
echo.

echo [TEST 9] Agregar contenido 888 a Ver Luego
curl -s -X POST "%API_URL%/perfil/1/verluego" -H "Content-Type: application/json" -d "{\"id_contenido\": 888}"
echo.
echo.

echo [TEST 10] Verificar si contenido 888 esta en Ver Luego
curl -s "%API_URL%/perfil/1/verluego/888/verificar"
echo.
echo.

echo [TEST 11] Agregar contenido 777 a Ver Luego para moverlo
curl -s -X POST "%API_URL%/perfil/1/verluego" -H "Content-Type: application/json" -d "{\"id_contenido\": 777}"
echo.
echo.

echo [TEST 12] Mover contenido 777 de Ver Luego a Favoritos
curl -s -X POST "%API_URL%/perfil/1/verluego/777/mover-favoritos"
echo.
echo.

echo [TEST 13] Obtener listas combinadas
curl -s "%API_URL%/perfil/1/listas?limit=5"
echo.
echo.

echo =============== PRUEBAS DE ELIMINACION ===============
echo.

echo [TEST 14] Eliminar contenido 999 de favoritos
curl -s -X DELETE "%API_URL%/perfil/1/favoritos/999"
echo.
echo.

echo [TEST 15] Eliminar contenido 888 de Ver Luego
curl -s -X DELETE "%API_URL%/perfil/1/verluego/888"
echo.
echo.

echo [TEST 16] Verificar eliminacion de favoritos
curl -s "%API_URL%/perfil/1/favoritos/999/verificar"
echo.
echo.

echo =============== PRUEBAS DE VALIDACION ===============
echo.

echo [TEST 17] ID de perfil invalido (debe fallar)
curl -s "%API_URL%/perfil/abc/favoritos"
echo.
echo.

echo [TEST 18] Agregar contenido sin ID (debe fallar)
curl -s -X POST "%API_URL%/perfil/1/favoritos" -H "Content-Type: application/json" -d "{}"
echo.
echo.

echo [TEST 19] Paginacion con limite mayor a 100 (debe fallar)
curl -s "%API_URL%/perfil/1/favoritos?limit=200"
echo.
echo.

echo ===============================================================
echo PRUEBAS COMPLETADAS
echo ===============================================================
pause