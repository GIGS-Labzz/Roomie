import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('v1/profiles')
export class ProfilesController {
  constructor(private readonly svc: ProfilesService) {}

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { id, message: 'profile placeholder' };
  }

  @Patch('me')
  updateMe(@Body() body: any) {
    return { message: 'update placeholder', body };
  }
}
