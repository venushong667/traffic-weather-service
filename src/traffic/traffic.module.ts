import { Module } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/primsa.service';
import { GeoModule } from 'src/geo/geo.module';

@Module({
    imports: [
        GeoModule,
        HttpModule,
    ],
    controllers: [TrafficController],
    providers: [
        TrafficService,
        PrismaService,
    ],
    exports: [TrafficService]
})
export class TrafficModule {}
