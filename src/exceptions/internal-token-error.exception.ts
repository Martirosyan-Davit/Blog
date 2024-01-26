import { BadRequestException } from '@nestjs/common';

export class InvalidTokenException extends BadRequestException {
  constructor(error?: string) {
    super('error.invalidToken', error);
  }
}
