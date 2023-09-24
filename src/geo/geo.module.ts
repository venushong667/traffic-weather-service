import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';
import { WeatherModule } from 'src/weather/weather.module';

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
