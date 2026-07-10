import { Controller, Get, Param } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('v1/network')
export class NetworkController {
  constructor(private readonly svc: NetworkService) {}

  @Get('mutual/:userId')
  getMutual(@Param('userId') userId: string) {
    return { userId, message: 'mutual connections placeholder' };
  }
}
