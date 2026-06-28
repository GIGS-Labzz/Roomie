import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('v1/admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('status')
  status() {
    return { message: 'admin placeholder' };
  }
}
