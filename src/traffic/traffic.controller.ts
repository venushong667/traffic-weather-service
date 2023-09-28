import { Controller, Get, Logger, Query } from '@nestjs/common';
import { Camera, Prisma } from '@prisma/client';
import { firstValueFrom, map, mergeMap } from 'rxjs';
import { CameraMetadata, ImageMetadata } from 'src/geo/interfaces';

import { GeoService } from '../geo/geo.service';
import { TrafficService } from './traffic.service';

export interface Traffic extends Omit<Camera, "latitude" | "longitude"> {
    image: {
        url: string,
        metadata: ImageMetadata
    },
    timestamp: string
}

@Controller('traffic')
export class TrafficController {
    private readonly logger = new Logger(TrafficController.name);

    constructor(
        private readonly trafficService: TrafficService,
        private readonly geoService: GeoService,
    ) {}
    
    @Get()
    async findAll(@Query('date_time') datetime: string) {
        try {
            // Get traffic data key by camera_id
            const latestCameras = await firstValueFrom(
                this.geoService.getTrafficData(datetime).pipe(
                    mergeMap(traffics => traffics.map(data => data.cameras)),
                    map(cams => {
                        const obj: { [camera_id: string]: CameraMetadata } = {}
                        cams.forEach(cam => {
                            obj[cam.camera_id] = cam;
                        });

                        return obj;
                    })
                )
            );
            const cameraIds = Object.keys(latestCameras);
            
            // Get previous stored camera metadata
            let recordedCameras = await this.trafficService.getCameras({
                where: {
                    id: { in: cameraIds }
                }
            });
            const recordedIds = recordedCameras.map(cam => cam.id);
            
            // Verify any unstored camera metadata exists
            const noRecordCameras = Object.values(latestCameras).filter(cam => !recordedIds.includes(cam.camera_id));
            if (noRecordCameras.length > 0) {
                const camerasToCreate = await this.geoService.getCameraLocation(noRecordCameras);
                const cameraData = camerasToCreate.map(cam => ({
                    id: cam.camera_id,
                    latitude: cam.location.latitude,
                    longitude: cam.location.longitude,
                    address: cam.address,
                    route: cam.route,
                    neighborhood: cam.neighborhood,
                    region: cam.region
                } satisfies Prisma.CameraCreateInput));

                await this.trafficService.createCamera(cameraData);
                recordedCameras = recordedCameras.concat(cameraData);
            }

            const res = recordedCameras.map(cam => ({
                id: cam.id,
                address: cam.address,
                route: cam.route,
                neighborhood: cam.neighborhood,
                region: cam.region,
                image: {
                    url: latestCameras[cam.id].image,
                    metadata: latestCameras[cam.id].image_metadata,
                },
                timestamp: latestCameras[cam.id].timestamp
            } satisfies Traffic as Traffic));

            return res;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
