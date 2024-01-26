import { RoleType } from '../../constants/index';
import { EnumField, UUIDField } from '../../decorators/index';

export class AccessTokenPayloadDto {
  @EnumField(() => RoleType)
  role!: RoleType;

  @UUIDField()
  userId!: Uuid;

  constructor(accessTokenPayloadDto: AccessTokenPayloadDto) {
    this.role = accessTokenPayloadDto.role;
    this.userId = accessTokenPayloadDto.userId;
  }
}
