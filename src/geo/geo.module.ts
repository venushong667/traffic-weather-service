import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WeatherModule } from '../weather/weather.module';
import { GeoService } from './geo.service';

@Module({
    imports: [
        HttpModule,
        WeatherModule
    ],
    providers: [
        GeoService
    ],
    exports: [GeoService]
})
export class GeoModule {}
