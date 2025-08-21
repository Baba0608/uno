import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      // TODO: add auth token validation
      const request = context.switchToHttp().getRequest();
      const userId = request.headers['x-user-id'];
      if (!userId) {
        return false;
      }
      request.user = { id: userId };
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
