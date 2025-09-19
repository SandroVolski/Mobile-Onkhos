# Teste de login e API
Write-Host "🔐 Testando login..." -ForegroundColor Yellow

$loginData = @{
    email = "teste@clinica.com"
    senha = "123456"
} | ConvertTo-Json

try {
    # Testar login
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
        Write-Host "👤 Usuário: $($loginResponse.data.user.nome)" -ForegroundColor Cyan
        Write-Host "🔑 Token: $($loginResponse.data.accessToken.Substring(0, 50))..." -ForegroundColor Cyan
        
        # Testar API de pacientes
        Write-Host "`n📋 Testando API de pacientes..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $($loginResponse.data.accessToken)"
        }
        
        $pacientesResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/pacientes" -Method GET -Headers $headers
        
        Write-Host "✅ Pacientes carregados: $($pacientesResponse.data.data.Count)" -ForegroundColor Green
        
        # Testar estatísticas
        Write-Host "`n📊 Testando estatísticas..." -ForegroundColor Yellow
        
        $statsResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/pacientes/stats" -Method GET -Headers $headers
        
        Write-Host "✅ Estatísticas carregadas:" -ForegroundColor Green
        Write-Host "   Total: $($statsResponse.data.total)" -ForegroundColor White
        Write-Host "   Ativos: $($statsResponse.data.ativo)" -ForegroundColor White
        Write-Host "   Inativos: $($statsResponse.data.inativo)" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erro no login: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}
