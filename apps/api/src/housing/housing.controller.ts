import { Controller, Get } from '@nestjs/common';
import { HousingService } from './housing.service';

@Controller('v1/housing')
export class HousingController {
  constructor(private readonly svc: HousingService) {}

  @Get()
  list() {
    return { message: 'housing placeholder' };
  }
}
