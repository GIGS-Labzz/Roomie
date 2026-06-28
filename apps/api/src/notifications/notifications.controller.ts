import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list() {
    return { message: 'notifications placeholder' };
  }
}
