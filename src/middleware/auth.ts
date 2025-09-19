import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, ApiResponse } from '../types';

interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: 'Token de acesso requerido'
    };
    res.status(401).json(response);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido ou expirado'
      };
      res.status(403).json(response);
      return;
    }

    req.user = decoded as JWTPayload;
    next();
  });
};

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '1h';
  
  return jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, refreshSecret, { expiresIn } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
    return jwt.verify(token, refreshSecret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Middleware para verificar se é médico
export const requireMedico = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Usuário não autenticado'
    };
    res.status(401).json(response);
    return;
  }

  if (req.user.role !== 'medico') {
    const response: ApiResponse = {
      success: false,
      message: 'Acesso restrito a médicos'
    };
    res.status(403).json(response);
    return;
  }

  next();
};

// Middleware para verificar se tem acesso à clínica
export const requireClinicaAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Usuário não autenticado'
    };
    res.status(401).json(response);
    return;
  }

  const clinicaId = parseInt(req.params.clinicaId || '0');
  
  if (clinicaId && (req.user.clinica_id || req.user.clinicaId) && (req.user.clinica_id || req.user.clinicaId) !== clinicaId) {
    const response: ApiResponse = {
      success: false,
      message: 'Acesso negado à esta clínica'
    };
    res.status(403).json(response);
    return;
  }

  next();
};
