import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('webhook')
  webhook(@Headers() headers: any, @Body() body: any) {
    return { message: 'webhook placeholder', headers, body };
  }
}
