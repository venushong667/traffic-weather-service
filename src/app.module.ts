import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrafficModule } from './traffic/traffic.module';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { GeoModule } from './geo/geo.module';
import configuration from './config/configuration';

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
