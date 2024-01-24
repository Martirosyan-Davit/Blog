import {
    type CanActivate,
    type ExecutionContext,
    Injectable,
} from '@nestjs/common';

import { UserUnauthenticatedException } from '../modules/auth/exceptions/user-unauthenticated.exception';
import { type UserEntity } from '../modules/user/user.entity';
import { RedisService } from '../shared/services/redis.service';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private readonly redisService: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authHeader = request?.headers?.authorization;

        if (!authHeader || !authHeader.includes('Bearer ')) {
            throw new UserUnauthenticatedException();
        }

        const token = (authHeader as string).slice(7);

        try {
            const user = <UserEntity>request.user;

            if (!(await this.redisService.checkSessionToken(user.id, token))) {
                throw new UserUnauthenticatedException();
            }
        } catch {
            throw new UserUnauthenticatedException();
        }

        return true;
    }
}
