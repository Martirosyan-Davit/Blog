import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { type PageDto } from '../../common/dto/page.dto';
import { type CreatePostDto } from './dtos/create-post.dto';
import { type PostDto } from './dtos/post.dto';
import { type PostPageOptionsDto } from './dtos/post-page-options.dto';
import { type UpdatePostDto } from './dtos/update-post.dto';
import { PostNotFoundException } from './exceptions/post-not-found.exception';
import { PostEntity } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async createPost(
    userId: Uuid,
    createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    const postEntity = this.postRepository.create({
      userId,
      title: createPostDto.title,
      body: createPostDto.body,
    });

    await this.postRepository.save(postEntity);

    return postEntity;
  }

  async getAllPost(
    postPageOptionsDto: PostPageOptionsDto,
  ): Promise<PageDto<PostDto>> {
    const queryBuilder = this.postRepository.createQueryBuilder('post');
    const [items, pageMetaDto] =
      await queryBuilder.paginate(postPageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getSinglePost(id: Uuid): Promise<PostEntity> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    return postEntity;
  }

  async updatePost(
    userId: Uuid,
    id: Uuid,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id })
      .andWhere('post.user_id = :userId', { userId });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    this.postRepository.merge(postEntity, updatePostDto);

    await this.postRepository.save(postEntity);
  }

  async deletePost(userId: Uuid, id: Uuid): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id })
      .andWhere('post.user_id = :userId', { userId });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    await this.postRepository.remove(postEntity);
  }
}
