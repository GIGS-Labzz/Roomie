import { Module } from '@nestjs/common';
import { HousingController } from './housing.controller';
import { HousingService } from './housing.service';

@Module({
  controllers: [HousingController],
  providers: [HousingService],
})
export class HousingModule {}
