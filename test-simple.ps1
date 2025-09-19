# Teste simples do login de médicos
Write-Host "🧪 Testando login de médicos..." -ForegroundColor Green

# Teste 1: Dr. João Silva
Write-Host "`n🔐 Testando Dr. João Silva..." -ForegroundColor Yellow
$body1 = @{
    email = "joao.silva@clinica-sp.com"
    crm = "123456-SP"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/medico/login" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "   Nome: $($response1.data.medico.nome)" -ForegroundColor White
    Write-Host "   Especialidade: $($response1.data.medico.especialidade)" -ForegroundColor White
    Write-Host "   Clínica: $($response1.data.medico.clinica_nome)" -ForegroundColor White
    Write-Host "   Token: $($response1.data.accessToken.Substring(0,20))..." -ForegroundColor White
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Dra. Maria Santos
Write-Host "`n🔐 Testando Dra. Maria Santos..." -ForegroundColor Yellow
$body2 = @{
    email = "maria.santos@clinica-sp.com"
    crm = "789012-SP"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/medico/login" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "   Nome: $($response2.data.medico.nome)" -ForegroundColor White
    Write-Host "   Especialidade: $($response2.data.medico.especialidade)" -ForegroundColor White
    Write-Host "   Clínica: $($response2.data.medico.clinica_nome)" -ForegroundColor White
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Credenciais inválidas
Write-Host "`n🚫 Testando credenciais inválidas..." -ForegroundColor Yellow
$body3 = @{
    email = "medico.inexistente@teste.com"
    crm = "999999-XX"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3002/api/mobile/medico/login" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "❌ Problema: credenciais inválidas foram aceitas!" -ForegroundColor Red
} catch {
    Write-Host "✅ Rejeição correta de credenciais inválidas" -ForegroundColor Green
}

Write-Host "`n🎉 Teste concluído!" -ForegroundColor Green
