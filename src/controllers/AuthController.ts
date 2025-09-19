import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { ApiResponse, LoginRequest, LoginResponse, JWTPayload } from '../types';

interface AuthRequest extends Request {
  user?: JWTPayload;
}

export class AuthController {
  
  // POST /api/mobile/auth/login - Login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha }: LoginRequest = req.body;
      
      if (!email || !senha) {
        const response: ApiResponse = {
          success: false,
          message: 'Email e senha são obrigatórios'
        };
        res.status(400).json(response);
        return;
      }

      // Verificar credenciais
      const user = await UserModel.verifyCredentials(email, senha);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Credenciais inválidas'
        };
        res.status(401).json(response);
        return;
      }

      // Gerar tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicaId: user.clinica_id
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Atualizar último login
      await UserModel.updateLastLogin(user.id);

      const loginResponse: LoginResponse = {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          clinica_id: user.clinica_id
        },
        accessToken,
        refreshToken
      };

      const response: ApiResponse<LoginResponse> = {
        success: true,
        message: 'Login realizado com sucesso',
        data: loginResponse
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro no login:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      res.status(500).json(response);
    }
  }

  // POST /api/mobile/auth/refresh - Renovar token
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token é obrigatório'
        };
        res.status(400).json(response);
        return;
      }

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token inválido ou expirado'
        };
        res.status(401).json(response);
        return;
      }

      // Verificar se usuário ainda existe e está ativo
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuário não encontrado ou inativo'
        };
        res.status(401).json(response);
        return;
      }

      // Gerar novo access token
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicaId: user.clinica_id
      };

      const newAccessToken = generateAccessToken(tokenPayload);

      const response: ApiResponse = {
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          accessToken: newAccessToken
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      res.status(500).json(response);
    }
  }

  // POST /api/mobile/auth/logout - Logout (opcional, apenas para limpeza no frontend)
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Em um sistema mais robusto, aqui poderíamos invalidar o token
      // Por ora, apenas retornamos sucesso
      
      const response: ApiResponse = {
        success: true,
        message: 'Logout realizado com sucesso'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro no logout:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      res.status(500).json(response);
    }
  }

  // GET /api/mobile/auth/me - Obter dados do usuário logado
  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuário não autenticado'
        };
        res.status(401).json(response);
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuário não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      const userData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        clinica_id: user.clinica_id
      };

      const response: ApiResponse = {
        success: true,
        message: 'Dados do usuário obtidos com sucesso',
        data: userData
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      res.status(500).json(response);
    }
  }

  // GET /api/mobile/auth/validate - Validar token
  static async validate(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Token inválido'
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Token válido',
        data: {
          valid: true,
          user: {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            clinicaId: req.user.clinicaId
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro ao validar token:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      res.status(500).json(response);
    }
  }
}
