import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('v1/posts')
export class PostsController {
  constructor(private readonly svc: PostsService) {}

  @Get()
  list() {
    return { message: 'posts placeholder' };
  }
}
