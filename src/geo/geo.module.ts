import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';

@Module({
    imports: [HttpModule],
    providers: [
        GeoService
    ],
    exports: [GeoService]
})
export class GeoModule {}
