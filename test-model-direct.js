// Simular o ambiente do backend
process.env.DB_HOST = '191.252.1.143';
process.env.DB_USER = 'douglas';
process.env.DB_PASSWORD = 'Douglas193';
process.env.DB_NAME = 'bd_sistema_clinicas';
process.env.DB_PORT = '3306';

const { MedicoMobileModel } = require('./src/models/MedicoMobileModel.ts');

async function testModelDirect() {
  try {
    console.log('🧪 Testando modelo diretamente...');
    
    const email = 'carlos.lima@clinica-rj.com';
    const crm = '222222-RJ';
    
    console.log(`🔍 Buscando: ${email} / ${crm}`);
    
    const medico = await MedicoMobileModel.findByEmailAndCRM(email, crm);
    
    console.log('📊 Resultado:', medico ? 'Médico encontrado' : 'Médico não encontrado');
    
    if (medico) {
      console.log('📋 Dados:', {
        id: medico.id,
        nome: medico.nome,
        email: medico.email,
        crm: medico.crm,
        status: medico.status
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testModelDirect();
