import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPayloadDto } from '../../common/dto/access-token-payload.dto';
import { TokenType } from '../../constants';
import { InvalidTokenException } from '../../exceptions/index';
import { TokenNotSavedException } from '../../exceptions/token-not-saved.exception';
import { TokenPayloadDto } from '../../modules/auth/dto/token-payload.dto';
import { RedisService } from './redis.service';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  private async createToken<T>(
    type: TokenType,
    params: T,
  ): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      accessToken: await this.jwtService.signAsync({
        type,
        ...params,
      }),
    });
  }

  async createAccessToken(
    accessTokenPayloadDto: AccessTokenPayloadDto,
  ): Promise<TokenPayloadDto> {
    const tokenPayloadDto = await this.createToken(
      TokenType.ACCESS_TOKEN,
      accessTokenPayloadDto,
    );

    const result = await this.redisService.saveSessionToken(
      accessTokenPayloadDto.userId,
      tokenPayloadDto.accessToken,
    );

    if (!result) {
      throw new TokenNotSavedException();
    }

    return tokenPayloadDto;
  }

  private async verifyAsync<T>(
    token: string,
    options: { type: TokenType },
  ): Promise<T & { type: TokenType }> {
    if (!token) {
      throw new InternalServerErrorException("Token can't be a null");
    }

    let data: T & { type: TokenType };

    try {
      data = await this.jwtService.verifyAsync<T & { type: TokenType }>(token, {
        algorithms: ['RS256'],
      });
    } catch {
      throw new InvalidTokenException();
    }

    if (data.type !== options.type) {
      throw new InvalidTokenException();
    }

    return data;
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayloadDto> {
    const tokenData = await this.verifyAsync<AccessTokenPayloadDto>(token, {
      type: TokenType.ACCESS_TOKEN,
    });

    return new AccessTokenPayloadDto(tokenData);
  }
}
