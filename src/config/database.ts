import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  //acquireTimeout: 60000,
  //timeout: 60000,
  //reconnect: true
};

// Debug: verificar se as variáveis de ambiente estão sendo carregadas
console.log('🔍 DB Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password ? '***' : 'EMPTY',
  database: dbConfig.database
});

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para executar queries
export const query = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na query:', sql, 'Params:', params, 'Error:', error);
    throw error;
  }
};

// Função para executar queries com limite
export const queryWithLimit = async (sql: string, params: any[] = [], limit: number = 10, offset: number = 0): Promise<any> => {
  const limitedSql = `${sql} LIMIT ? OFFSET ?`;
  const newParams = [...params, limit, offset];
  console.log('🔍 QueryWithLimit - SQL:', limitedSql);
  console.log('🔍 QueryWithLimit - Params:', newParams);
  
  try {
    // Usar connection.query em vez de connection.execute para LIMIT/OFFSET
    const [rows] = await pool.query(limitedSql, newParams);
    return rows;
  } catch (error) {
    console.error('Erro na queryWithLimit:', limitedSql, 'Params:', newParams, 'Error:', error);
    throw error;
  }
};

// Função para testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.execute('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
};

// Função para fechar conexões
export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
