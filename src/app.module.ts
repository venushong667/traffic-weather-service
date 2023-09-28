import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { GeoModule } from './geo/geo.module';
import { TrafficModule } from './traffic/traffic.module';
import { WeatherModule } from './weather/weather.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            cache: true,
        }),
        TrafficModule,
        WeatherModule,
        GeoModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
