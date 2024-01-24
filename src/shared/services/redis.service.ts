import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  private async set(
    key: string,
    value: string,
    expiry = -1,
  ): Promise<'OK' | null> {
    if (expiry > 0) {
      return this.redisClient.set(key, value, 'EX', expiry);
    }

    return this.redisClient.set(key, value);
  }

  private async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  private async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  private async isCached(key: string, value: string): Promise<boolean> {
    return (await this.redisClient.get(key)) === value;
  }

  public async saveSessionToken(
    userId: Uuid,
    sessionToken: string,
  ): Promise<'OK' | null> {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const result = await this.set(`user:${userId}`, sessionToken);

    return result;
  }

  public async getSessionToken(userId: Uuid): Promise<string | null> {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const result = await this.get(`user:${userId}`);

    return result;
  }

  public async removeSessionToken(userId: Uuid): Promise<number> {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const result = await this.del(`user:${userId}`);

    return result;
  }

  public async checkSessionToken(
    userId: Uuid,
    token: string,
  ): Promise<boolean> {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const result = this.isCached(`user:${userId}`, token);

    return result;
  }
}
