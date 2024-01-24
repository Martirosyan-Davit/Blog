import { StringField } from '../../../decorators';

export class TokenPayloadDto {
  //   use this if use expiration time for token
  //   @NumberField()
  //   expiresIn: number;

  @StringField()
  accessToken: string;

  constructor(data: { /* expiresIn: number; */ accessToken: string }) {
    // this.expiresIn = data.expiresIn;
    this.accessToken = data.accessToken;
  }
}
