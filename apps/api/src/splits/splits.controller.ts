import { Controller, Post } from '@nestjs/common';
import { SplitsService } from './splits.service';

@Controller('v1/splits')
export class SplitsController {
  constructor(private readonly svc: SplitsService) {}

  @Post()
  create() {
    return { message: 'split placeholder' };
  }
}
