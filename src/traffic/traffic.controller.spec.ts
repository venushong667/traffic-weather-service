import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CameraMetadata, TrafficItem } from 'src/geo/interfaces';

import { GeoService } from '../geo/geo.service';
import { Traffic, TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';

describe('TrafficController', () => {
    let trafficController: TrafficController;

    const mockTrafficService = {
        getCameras: jest.fn(({ where: { id: { in: [id] } } }) => {
            if (id === "unseen_cam_id") {
                return []
            }
            
            return [{
                id: "1",
                latitude: 1,
                longitude: 1,
                address: "address",
                route: "route",
                neighborhood: "neighborhood",
                region: "central",
            }]
            
        }),
        createCamera: jest.fn((data) => {
            return {
                id: '1',
                ...data
            }
        })
    }

    const mockGeoService = {
        getTrafficData: jest.fn((datetime) => {
            return of([{
                timestamp: new Date().toISOString().split('.')[0],
                cameras: [{
                    timestamp: new Date().toISOString().split('.')[0],
                    image: "image_url",
                    location: {
                        longitude: 1,
                        latitude: 1
                    },
                    camera_id: datetime === new Date("2023-09-07").toISOString().split('.')[0] ? "unseen_cam_id" : "1" ,
                    image_metadata: {
                        height: 1,
                        width: 1,
                        md: "md"
                    }
                }] satisfies CameraMetadata[] as CameraMetadata[]
            }] satisfies TrafficItem[] as TrafficItem[])
            
        }),
        getCameraLocation: jest.fn((cameras: CameraMetadata[]) => {
            const promises = cameras.map(async (cam) => {
                return {
                    ...cam,
                    address: 'address',
                    route: 'route',
                    neighborhood: 'neighborhood',
                    region: 'central'
                }
            })
            return Promise.all(promises);
        })
    }

    const mockConfigService = {
        gov_api: {
            url: 'gov_api_key'
        }
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forFeature(async () => (mockConfigService))
            ],
            controllers: [TrafficController],
            providers: [
                TrafficService,
                GeoService
            ],
        })
            .overrideProvider(TrafficService)
            .useValue(mockTrafficService)
            .overrideProvider(GeoService)
            .useValue(mockGeoService)
            .compile();

        trafficController = module.get<TrafficController>(TrafficController);
    });

    describe('findAll', () => {
        it('seen camera data should not store and return directly', async () => {
            const datetime = "other date";
            const result = [{
                id: '1',
                address: expect.any(String),
                route: expect.any(String),
                neighborhood: expect.any(String),
                region: expect.any(String),
                image: {
                    url: expect.any(String),
                    metadata: {
                        height: expect.any(Number),
                        width: expect.any(Number),
                        md: expect.any(String)
                    },
                },
                timestamp: expect.any(String)
            }] satisfies Traffic[] as Traffic[]

            expect(await trafficController.findAll(datetime)).toEqual(result);

            expect(mockGeoService.getTrafficData).toHaveBeenCalled();
            expect(mockTrafficService.getCameras).toHaveBeenCalled();
            // functions used to store data should not be called
            expect(mockGeoService.getCameraLocation).not.toHaveBeenCalled();
            expect(mockTrafficService.createCamera).not.toHaveBeenCalled();
        })

        it('should store unseen camera location data and return it', async () => {
            const datetime = new Date("2023-09-07").toISOString().split('.')[0];
            const result = [{
                id: 'unseen_cam_id',
                address: expect.any(String),
                route: expect.any(String),
                neighborhood: expect.any(String),
                region: expect.any(String),
                image: {
                    url: expect.any(String),
                    metadata: {
                        height: expect.any(Number),
                        width: expect.any(Number),
                        md: expect.any(String)
                    },
                },
                timestamp: expect.any(String)
            }] satisfies Traffic[] as Traffic[]

            expect(await trafficController.findAll(datetime)).toEqual(result);

            expect(mockGeoService.getTrafficData).toHaveBeenCalled();
            expect(mockTrafficService.getCameras).toHaveBeenCalled();
            expect(mockGeoService.getCameraLocation).toHaveBeenCalled();
            expect(mockTrafficService.createCamera).toHaveBeenCalled();
        })

        
    })
});
