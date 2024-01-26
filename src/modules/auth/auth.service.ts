import { Injectable } from '@nestjs/common';

import { validateHash } from '../../common/utils';
import { MessageType } from '../../constants';
import { UserNotFoundException } from '../../exceptions';
import { type IMessage } from '../../interfaces/index';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RedisService } from '../../shared/services/redis.service';
import { UserService } from '../user/user.service';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { type UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtTokenService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  async validateUser(userLoginDto: UserLoginDto): Promise<LoginPayloadDto> {
    const userEntity = await this.userService.findOne({
      email: userLoginDto.email,
    });

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      userEntity.password,
    );

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    const token = await this.jwtTokenService.createAccessToken({
      userId: userEntity.id,
      role: userEntity.role,
    });

    return new LoginPayloadDto(userEntity.toDto(), token);
  }

  async logout(id: Uuid): Promise<IMessage> {
    await this.redisService.removeSessionToken(id);

    return { message: MessageType.SUCCESSFULLY_LOGGED_OUT };
  }
}
