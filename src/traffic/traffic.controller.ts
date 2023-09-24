import { Controller, Get, Query } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { CameraMetadata, GeoService, ImageMetadata } from 'src/geo/geo.service';
import { firstValueFrom, map, mergeMap } from 'rxjs';
import { Camera, Prisma } from '@prisma/client';

export interface Traffic extends Omit<Camera, "latitude" | "longitude"> {
    image: {
        url: string,
        metadata: ImageMetadata
    },
    timestamp: string
}

@Controller('traffic')
export class TrafficController {
    constructor(
        private readonly trafficService: TrafficService,
        private readonly geoService: GeoService,
    ) {}
    
    @Get()
    async findAll(@Query('date_time') datetime: string) {
        try {
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
            
            let recordedCameras = await this.trafficService.getCameras({
                where: {
                    id: { in: cameraIds }
                }
            });

            if (cameraIds.length != recordedCameras.length) {
                const recordedIds = recordedCameras.map(cam => cam.id);
                const noRecordCameras = Object.values(latestCameras).filter(cam => !recordedIds.includes(cam.camera_id));
                const camerasToCreate = await this.geoService.getCameraLocation(noRecordCameras);
                const cameraData = camerasToCreate.map(cam => ({
                    id: cam.camera_id,
                    latitude: cam.location.latitude,
                    longitude: cam.location.longitude,
                    route: cam.route,
                    neighborhood: cam.neighborhood,
                    region: cam.region
                } satisfies Prisma.CameraCreateInput));

                await this.trafficService.createCamera(cameraData);
                recordedCameras = recordedCameras.concat(cameraData);
            }
            
            const res = recordedCameras.map(cam => ({
                id: cam.id,
                route: cam.route,
                neighborhood: cam.neighborhood,
                region: cam.region,
                image: {
                    url: latestCameras[cam.id].image,
                    metadata: latestCameras[cam.id].image_metadata,
                },
                timestamp: latestCameras[cam.id].timestamp
            } satisfies Traffic));

            return res;
        } catch (err) {
            throw err;
        }
    }
}
