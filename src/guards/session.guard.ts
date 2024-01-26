import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { UserUnauthenticatedException } from '../modules/auth/exceptions/user-unauthenticated.exception';
import { JwtTokenService } from '../shared/services/jwt-token.service';
import { RedisService } from '../shared/services/redis.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request?.headers?.authorization;

    if (!authHeader || !authHeader.includes('Bearer ')) {
      throw new UserUnauthenticatedException();
    }

    const token = (authHeader as string).slice(7);

    try {
      const data = await this.jwtTokenService.verifyAccessToken(token);

      const is = await this.redisService.checkSessionToken(data.userId, token);

      if (!is) {
        throw new UserUnauthenticatedException();
      }
    } catch {
      throw new UserUnauthenticatedException();
    }

    return true;
  }
}
