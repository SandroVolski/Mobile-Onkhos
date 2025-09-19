# Teste detalhado da API
Write-Host "🔐 Testando login..." -ForegroundColor Yellow

$loginData = @{
    email = "teste@clinica.com"
    senha = "123456"
} | ConvertTo-Json

try {
    # 1. Fazer login
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
        Write-Host "👤 Usuário: $($loginResponse.data.user.nome)" -ForegroundColor Cyan
        $token = $loginResponse.data.accessToken
        
        # 2. Testar health
        Write-Host "`n🏥 Testando health..." -ForegroundColor Yellow
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/health" -Method GET
            Write-Host "✅ Health OK: $($healthResponse.message)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Health falhou: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # 3. Testar /me
        Write-Host "`n👤 Testando /me..." -ForegroundColor Yellow
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
            }
            $meResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/auth/me" -Method GET -Headers $headers
            Write-Host "✅ Me OK: $($meResponse.data.nome)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Me falhou: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # 4. Testar pacientes com tratamento de erro detalhado
        Write-Host "`n📋 Testando pacientes..." -ForegroundColor Yellow
        try {
            $pacientesResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/mobile/pacientes?page=1&limit=5" -Method GET -Headers $headers
            
            Write-Host "Status Code: $($pacientesResponse.StatusCode)" -ForegroundColor Cyan
            Write-Host "Content Type: $($pacientesResponse.Headers.'Content-Type')" -ForegroundColor Cyan
            
            if ($pacientesResponse.StatusCode -eq 200) {
                $pacientesData = $pacientesResponse.Content | ConvertFrom-Json
                Write-Host "✅ Pacientes OK!" -ForegroundColor Green
                Write-Host "Total: $($pacientesData.data.pagination.total)" -ForegroundColor White
                Write-Host "Pacientes encontrados: $($pacientesData.data.data.Count)" -ForegroundColor White
            } else {
                Write-Host "❌ Status inesperado: $($pacientesResponse.StatusCode)" -ForegroundColor Red
                Write-Host "Conteúdo: $($pacientesResponse.Content)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "❌ Pacientes falhou: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response Body: $responseBody" -ForegroundColor Red
            }
        }
        
    } else {
        Write-Host "❌ Erro no login: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro geral: $($_.Exception.Message)" -ForegroundColor Red
}
