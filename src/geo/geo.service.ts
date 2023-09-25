import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { catchError, firstValueFrom, map, of, switchMap } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { AreaMetadata, WeatherService } from 'src/weather/weather.service';
import { neighborhoodRegionMap } from './constants';

export interface Traffic {
    items: TrafficItem[],
    api_info: APIStatus
}

export interface APIStatus {
    status: string
}

export interface TrafficItem {
    timestamp: string,
    cameras: CameraMetadata[]
}

export interface CameraWithLoc extends CameraMetadata {
    address: string,
    route: string,
    neighborhood: string,
    region: string
}

export interface CameraMetadata {
    timestamp: string,
    image: string,
    location: Coordinate,
    camera_id: string,
    image_metadata: ImageMetadata
}

export interface ImageMetadata {
    height: number,
    width: number,
    md: string
}

export interface Coordinate {
    longitude: number,
    latitude: number
}

interface GoogleResponse {
    plus_code: {
        compound_code: string,
        global_code: string
    },
    results: {
        address_components: AddrComponents[],
        formatted_address: string,
        types: string[]
    }[],
    error_message?: string,
    status: string
}

interface AddrComponents {
    long_name: string,
    short_name: string,
    types: string[]
}

@Injectable()
export class GeoService {
    private readonly logger = new Logger(GeoService.name);
    private trafficEndpoint: string;
    private googleEndpoint: string;

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
        private weatherService: WeatherService
    ) {
        this.trafficEndpoint = join(configService.get("gov_api.url"), 'transport');
        this.googleEndpoint = join(configService.get("google_maps.url"), 'geocode/json');
    }

    getTrafficData(datetime?: string) {
        // datetime format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // const currentDT = new Date().toISOString().split('.')[0];
        const params = {};
        if (datetime) {
            params['date_time'] = datetime;
        }

        return this.httpService.get<Traffic>(join(this.trafficEndpoint, 'traffic-images'), { params: params }).pipe(
            map(res => res.data.items),
            catchError((error: AxiosError) => {
                this.logger.error(error.response.data);
                throw error;
            })
        )
    }

    getCameraLocation(cameras: CameraMetadata[]) {
        const promises = cameras.map(async (cam) => {
            const geo = await firstValueFrom(this.reverseGeocoding(cam.location));
            if (!geo.neighborhood) {
                const areaMetadata = await this.weatherService.getAreaMetadata();
                geo.neighborhood = this.computeMinDistance(cam.location, areaMetadata)[0].name;
            }

            const data: CameraWithLoc = {
                ...cam,
                address: geo.address,
                route: geo.route,
                neighborhood: geo.neighborhood,
                region: neighborhoodRegionMap[geo.neighborhood]
            }
            return data;
        })
        
        return Promise.all(promises);
    }

    googleGeocoding(target: Coordinate) {
        return this.httpService.get<GoogleResponse>(
            this.googleEndpoint,
            {
                params: {
                    key: this.configService.get('google_maps.apikey'),
                    latlng: `${target.latitude},${target.longitude}`
                }
            }
        ).pipe(
            map(res => {
                // Google API still return 200 status code even error ex. access denied/bad request, hence manual error check
                if (res.data.error_message) {
                    throw new AxiosError(res.data.error_message, '500', null, null, { data: res.data.error_message, status: 500, statusText: res.data.status, headers: res.headers, config: res.config, request: res.request } satisfies AxiosResponse);
                }

                return res.data.results;
            }),
            catchError((error: AxiosError) => {
                this.logger.error(error.response.data);
                throw error;
            })
        )
    }

    reverseGeocoding(target: Coordinate) {
        return this.googleGeocoding(target).pipe(
            map(results => this.mapLocTypesToInfo(results)),
            switchMap(typesMap => {
                const { route, street_address, premise, neighborhood } = typesMap

                const address = street_address ? street_address[0].formatted_address : premise ? premise[0].formatted_address : null;
                const rte = route ? route[0].address_components[0].long_name : null;
                const neighbh = neighborhood ? neighborhood[0].formatted_address : null;

                return of({ address: address ?? rte, route: rte, neighborhood: neighbh });
            }),
            catchError((error: any) => {
                this.logger.error(error.response.data);
                throw error;
            })
        )
    }

    mapLocTypesToInfo (results: GoogleResponse['results']) {
        const types = ['route', 'street_address', 'premise', 'neighborhood'];
        const typesMap: { [type: string]: {
            address_components: AddrComponents[],
            formatted_address: string,
            types: string[]
        }[] } = results.reduce((mapping, res) => {
            res.types.forEach(type => {
                if (types.includes(type)) {
                    if (type === 'neighborhood') {
                        // Get recognized neighborhood names only to eliminate Google API returned different type of neighborhood value
                        const recognizedNbh = res.address_components.find(comp => comp.types.includes('neighborhood') && Object.keys(neighborhoodRegionMap).includes(comp.long_name))
                        if (!recognizedNbh) return

                        res.formatted_address = recognizedNbh.long_name;
                    }
                    mapping[type] = mapping[type] || [];
                    mapping[type].push(res);
                }
            });
            return mapping;
        }, {});

        return typesMap;
    }

    computeMinDistance(target: Coordinate, areaMetadata: AreaMetadata[]) {
        areaMetadata.forEach(area => {
            area['distance'] = this.computeHaversine(target, area.label_location);
        })
        areaMetadata.sort(function(a, b) { 
            return a['distance'] - b['distance'];
        });
        
        return areaMetadata;
    }

    // Source: https://www.geodatasource.com/developers/javascript
    computeHaversine(loc1: Coordinate, loc2: Coordinate, unit = 'K') {
        if ((loc1.latitude == loc2.latitude) && (loc1.longitude == loc2.longitude)) {
            return 0;
        } else {
            const radlat1 = Math.PI * loc1.latitude/180;
            const radlat2 = Math.PI * loc2.latitude/180;
            const theta = loc1.longitude - loc2.longitude;
            const radtheta = Math.PI * theta/180;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;

            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }

            return dist;
        }
    }
}
