import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeoModule } from 'src/geo/geo.module';
import { PrismaService } from 'src/primsa.service';

import { TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';

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
