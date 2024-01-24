import { BadRequestException } from '@nestjs/common';

export class TokenNotSavedException extends BadRequestException {
  constructor(error?: string) {
    super('error.tokenNotSaved', error);
  }
}
