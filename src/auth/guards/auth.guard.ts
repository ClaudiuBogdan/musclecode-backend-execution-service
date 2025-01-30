import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloakService: KeycloakService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      // First verify the token's signature and expiration
      await this.keycloakService.verifyToken(token);

      // Then get the user info and roles
      const user = await this.authService.validateUser(token);
      request.user = user;
      return true;
    } catch (error: unknown) {
      console.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
