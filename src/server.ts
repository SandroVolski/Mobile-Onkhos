import dotenv from 'dotenv';
import path from 'path';

// CARREGAR VARIÁVEIS DE AMBIENTE PRIMEIRO - ANTES DE TUDO
const envPath = path.resolve(process.cwd(), '.env');
console.log('🔍 Carregando .env de:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Erro ao carregar .env:', result.error);
} else {
  console.log('✅ Arquivo .env carregado com sucesso');
}

// Debug: verificar se as variáveis estão sendo carregadas
console.log('🔍 Environment Variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'EMPTY',
  PORT: process.env.PORT
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import { testConnection } from './config/database';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting mais restritivo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas de login por IP por janela
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true
});

app.use('/api/mobile/medico/login', loginLimiter);

// CORS - Configuração mais permissiva para desenvolvimento
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Permitir requests sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000', 
      'http://localhost:5173', 
      'http://localhost:5050',
      'http://localhost:3001',
      'http://localhost:8080'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS: Origin não permitida:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Para suportar navegadores legados
};

app.use(cors(corsOptions));

// Middleware adicional para CORS preflight
app.options('*', cors(corsOptions));

// Middleware para parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para logs de request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rotas principais
app.use('/api/mobile', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Med Sync Mobile Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/mobile/health',
      auth: {
        login: 'POST /api/mobile/auth/login',
        refresh: 'POST /api/mobile/auth/refresh',
        me: 'GET /api/mobile/auth/me',
        validate: 'GET /api/mobile/auth/validate',
        logout: 'POST /api/mobile/auth/logout'
      },
      pacientes: {
        list: 'GET /api/mobile/pacientes',
        show: 'GET /api/mobile/pacientes/:id',
        stats: 'GET /api/mobile/pacientes/stats',
        recent: 'GET /api/mobile/pacientes/recent',
        search: 'GET /api/mobile/pacientes/search'
      }
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { error: error.message })
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Med Sync Mobile Backend rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API disponível em: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/mobile/health`);
      console.log(`📱 Mobile API: http://localhost:${PORT}/api/mobile`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para shutdown graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
