import { StringFieldOptional } from '../../../decorators/field.decorators';

export class UpdatePostDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  body?: string;
}
