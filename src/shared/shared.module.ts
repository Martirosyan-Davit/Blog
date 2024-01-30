import { Global, Module, type Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ApiConfigService } from './services/api-config.service';
import { GeneratorService } from './services/generator.service';
import { JwtTokenService } from './services/jwt-token.service';
import { RedisService } from './services/redis.service';

const providers: Provider[] = [
  ApiConfigService,
  GeneratorService,
  RedisService,
  JwtTokenService,
];

@Global()
@Module({
  providers,
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ApiConfigService) => ({
        privateKey: configService.authConfig.privateKey,
        publicKey: configService.authConfig.publicKey,
        signOptions: {
          algorithm: 'RS256',
          //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
        },
        verifyOptions: {
          algorithms: ['RS256'],
        },
        // if you want to use token with expiration date
        // signOptions: {
        //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
        // },
      }),
      inject: [ApiConfigService],
    }),
    CqrsModule,
  ],
  exports: [...providers, CqrsModule],
})
export class SharedModule {}
