import { Controller, Post, Body } from '@nestjs/common';
import { AgreementsService } from './agreements.service';

@Controller('v1/agreements')
export class AgreementsController {
  constructor(private readonly svc: AgreementsService) {}

  @Post()
  create(@Body() body: any) {
    return { message: 'agreement placeholder', body };
  }
}
