import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import type { DecodedToken } from '../interfaces/decoded-token.interface';
import { StructuredLogger } from 'src/logger/structured-logger.service';

@Injectable()
export class KeycloakService implements OnModuleInit {
  private logger: StructuredLogger;
  private publicKey: string | null = null;

  constructor(private configService: ConfigService) {
    this.logger = new StructuredLogger().child({
      context: 'KeycloakService',
    });
  }

  async onModuleInit() {
    await this.fetchPublicKey();
  }

  private async fetchPublicKey(): Promise<void> {
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const baseUrl = this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL');

    if (!realm || !baseUrl) {
      throw new Error('Missing required Keycloak configuration');
    }

    const response = await fetch(`${baseUrl}/realms/${realm}`);

    if (!response.ok) {
      throw new Error('Failed to fetch Keycloak public key');
    }

    const data = await response.json();
    this.publicKey = `-----BEGIN PUBLIC KEY-----\n${data.public_key}\n-----END PUBLIC KEY-----`;
  }

  async verifyToken(token: string): Promise<DecodedToken> {
    if (!this.publicKey) {
      await this.fetchPublicKey();
    }

    try {
      if (!this.publicKey) {
        throw new Error('Public key not available');
      }

      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as DecodedToken;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserInfo(token: string): Promise<any> {
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const baseUrl = this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL');

    if (!realm || !baseUrl) {
      throw new Error('Missing required Keycloak configuration');
    }

    const response = await fetch(
      `${baseUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch user info');
    }

    return response.json();
  }
}
