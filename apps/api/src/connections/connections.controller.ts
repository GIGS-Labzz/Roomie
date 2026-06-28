import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ConnectionsService } from './connections.service';

@Controller('v1/connections')
export class ConnectionsController {
  constructor(private readonly svc: ConnectionsService) {}

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { id, message: 'connection placeholder' };
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'create connection placeholder', body };
  }
}
