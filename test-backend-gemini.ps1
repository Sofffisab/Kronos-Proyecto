# Script de prueba para la conexión Backend <-> Gemini.py
# Uso: .\test-backend-gemini.ps1

$API_URL = "http://localhost:3000"
$TOKEN = "TU_JWT_TOKEN_AQUI"  # Reemplaza con tu token

Write-Host "🧪 Test Backend <-> Gemini.py" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Paso 1: Guardar página de prueba
Write-Host "`n📝 Paso 1: Guardando página de prueba..." -ForegroundColor Yellow

$testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

$body = @{
    pagina_id = 1
    tema = "e-commerce de tecnología"
    archivos = @(
        @{
            nombre = "index.html"
            lenguaje = "html"
            codigo = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Test Page</title>
</head>
<body>
    <h1>Mi Sitio Web</h1>
    <p>Contenido de prueba</p>
</body>
</html>
"@
        },
        @{
            nombre = "styles.css"
            lenguaje = "css"
            codigo = "body { font-family: Arial; margin: 0; padding: 20px; }"
        }
    )
    foto_pagina_jpg = $testImageBase64
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "$API_URL/api/ia/analize/pages" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $TOKEN"
        } `
        -Body $body

    Write-Host "✅ Página guardada exitosamente" -ForegroundColor Green
    Write-Host ($response1 | ConvertTo-Json -Depth 5) -ForegroundColor Gray

    # Paso 2: Procesar con IA
    Write-Host "`n🤖 Paso 2: Procesando con Gemini.py (esto puede tardar 60-90s)..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    $response2 = Invoke-RestMethod -Uri "$API_URL/api/ia/analize/pages/1" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
        }
    
    $elapsed = (Get-Date) - $startTime
    Write-Host "✅ IA procesó exitosamente en $($elapsed.TotalSeconds) segundos" -ForegroundColor Green
    Write-Host ($response2 | ConvertTo-Json -Depth 3) -ForegroundColor Gray

    # Paso 3: Guardar respuesta
    Write-Host "`n💾 Paso 3: Guardando respuesta de IA..." -ForegroundColor Yellow
    
    $response3 = Invoke-RestMethod -Uri "$API_URL/api/ia/analize/pages/1/response" `
        -Method PUT `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $TOKEN"
        } `
        -Body ($response2.resultado | ConvertTo-Json -Depth 10)

    Write-Host "✅ Respuesta guardada exitosamente" -ForegroundColor Green
    Write-Host ($response3 | ConvertTo-Json -Depth 5) -ForegroundColor Gray

    Write-Host "`n🎉 ¡Todas las pruebas pasaron correctamente!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ Error en la prueba:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
