import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { KeycloakService } from './services/keycloak.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AuthService, AuthGuard, KeycloakService],
  exports: [AuthService, AuthGuard, KeycloakService],
})
export class AuthModule {}
