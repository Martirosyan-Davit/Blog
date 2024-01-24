import {
  EmailFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class UpdateUserDto {
  @StringFieldOptional()
  firstName?: string;

  @StringFieldOptional()
  lastName?: string;

  @EmailFieldOptional()
  email?: string;
}
