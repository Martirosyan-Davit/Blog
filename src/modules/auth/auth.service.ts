import { Injectable } from '@nestjs/common';

import { validateHash } from '../../common/utils';
import { MessageType, type RoleType, TokenType } from '../../constants';
import { UserNotFoundException } from '../../exceptions';
import { TokenNotSavedException } from '../../exceptions/token-not-saved.exception';
import { type IMessage } from '../../interfaces/index';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RedisService } from '../../shared/services/redis.service';
import { type UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { type TokenPayloadDto } from './dto/token-payload.dto';
import { type UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtTokenService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  async createAccessToken(data: {
    role: RoleType;
    userId: Uuid;
  }): Promise<TokenPayloadDto> {
    const tokenPayload = {
      userId: data.userId,
      type: TokenType.ACCESS_TOKEN,
      role: data.role,
    };

    const tokenPayloadDto =
      await this.jwtTokenService.createAccessToken(tokenPayload);

    const result = await this.redisService.saveSessionToken(
      data.userId,
      tokenPayloadDto.accessToken,
    );

    if (!result) {
      throw new TokenNotSavedException();
    }

    return tokenPayloadDto;
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      email: userLoginDto.email,
    });

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    );

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    return user!;
  }

  async logout(id: Uuid): Promise<IMessage> {
    await this.redisService.removeSessionToken(id);

    return { message: MessageType.SUCCESSFULLY_LOGGED_OUT };
  }
}
