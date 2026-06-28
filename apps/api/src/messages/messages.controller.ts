import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('v1/messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Get()
  list() {
    return { message: 'messages list placeholder' };
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'message create placeholder', body };
  }
}
