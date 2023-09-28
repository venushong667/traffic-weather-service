import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
    imports: [HttpModule],
    controllers: [WeatherController],
    providers: [WeatherService],
    exports: [WeatherService],
})
export class WeatherModule {}
