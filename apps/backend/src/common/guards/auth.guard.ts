import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const userId = request.headers['x-user-id'];
      const authHeader = request.headers['authorization'];

      if (!userId || !authHeader) {
        throw new UnauthorizedException('Missing authentication headers');
      }

      // Extract token from Authorization header
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Invalid authorization header');
      }

      // Validate the JWT token
      const decoded = this.validateJWTToken(token, userId);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      // Set user info in request for use in controllers
      request.user = { id: parseInt(userId) };
      return true;
    } catch (error) {
      console.error('Auth guard error:', error);
      return false;
    }
  }

  private validateJWTToken(token: string, userId: string): any {
    try {
      // Verify JWT token with secret
      const decoded = jwt.verify(token, this.jwtSecret) as any;

      // Check if user ID matches
      if (decoded.userId !== userId) {
        return null;
      }

      // Check if token is not expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('JWT validation error:', error);
      return null;
    }
  }
}
