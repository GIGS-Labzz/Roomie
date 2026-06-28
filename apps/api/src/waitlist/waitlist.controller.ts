import { Controller, Post, Body } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';

@Controller('v1/waitlist')
export class WaitlistController {
  constructor(private readonly svc: WaitlistService) {}

  @Post()
  create(@Body() body: any) {
    return { message: 'waitlist placeholder', body };
  }
}
