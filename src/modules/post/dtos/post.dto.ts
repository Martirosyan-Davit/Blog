import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UUIDField } from '../../../decorators/field.decorators';
import { type PostEntity } from '../post.entity';

export class PostDto extends AbstractDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  body?: string;

  @UUIDField()
  userId: Uuid;

  constructor(postEntity: PostEntity) {
    super(postEntity);
    this.title = postEntity.title;
    this.body = postEntity.body;
    this.userId = postEntity.userId;
  }
}
