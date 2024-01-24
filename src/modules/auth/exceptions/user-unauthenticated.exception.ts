import { UnauthorizedException } from '@nestjs/common';

export class UserUnauthenticatedException extends UnauthorizedException {
  constructor(description?: string) {
    super(
      `User unauthenticated.${description ? ' ' + description : ''}`,
      'user_unauthenticated',
    );
  }
}
