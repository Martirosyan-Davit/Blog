import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type IMessage } from 'interfaces/IMessage';

import { validateHash } from '../../common/utils';
import { MessageType, type RoleType, TokenType } from '../../constants';
import { UserNotFoundException } from '../../exceptions';
import { RedisService } from '../../shared/services/redis.service';
import { type UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { type UserLoginDto } from './dto/user-login.dto';
import { TokenNotSavedException } from './exceptions/token-not-saved.exception';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private redisService: RedisService, // use for save tokens  RedisService
  ) {}

  //   async createAccessToken(data: {
  //     role: RoleType;
  //     userId: Uuid;
  //   }): Promise<TokenPayloadDto> {
  //     return new TokenPayloadDto({
  //       expiresIn: this.configService.authConfig.jwtExpirationTime,
  //       accessToken: await this.jwtService.signAsync({
  //         userId: data.userId,
  //         type: TokenType.ACCESS_TOKEN,
  //         role: data.role,
  //       }),
  //     });
  //   }

  async createAccessToken(data: {
    role: RoleType;
    userId: Uuid;
  }): Promise<TokenPayloadDto> {
    const tokenPayload = {
      userId: data.userId,
      type: TokenType.ACCESS_TOKEN,
      role: data.role,
    };

    const token = await this.jwtService.signAsync(tokenPayload);

    const result = await this.redisService.saveSessionToken(data.userId, token);

    if (!result) {
      throw new TokenNotSavedException();
    }

    return new TokenPayloadDto({
      accessToken: token,
    });
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
