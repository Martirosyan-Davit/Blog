import { StringField } from '../../../decorators';

export class TokenPayloadDto {
  @StringField()
  accessToken: string;

  constructor(data: { accessToken: string }) {
    this.accessToken = data.accessToken;
  }
}
