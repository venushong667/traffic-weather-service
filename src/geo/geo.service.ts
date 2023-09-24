import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

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

export interface CameraMetadata {
    timestamp: string,
    image: string,
    location: Location,
    camera_id: string,
    image_metadata: ImageMetadata
}

export interface Location {
    latitude: number,
    longitude: number
}

export interface ImageMetadata {
    height: number,
    width: number,
    md: string,
}

export interface PosstackResponse {
    latitude: number,
    longitude: number,
    type: string,
    distance: number,
    name: string,
    number: string,
    postal_code: string,
    street: string,
    confidence: number,
    region: string,
    region_code: string,
    county: null,
    locality: string,
    administrative_area: null,
    neighbourhood: null,
    country: string,
    country_code: string,
    continent: string,
    label: string
}

@Injectable()
export class GeoService {
    private readonly logger = new Logger(GeoService.name);
    private trafficEndpoint: string;
    private regionEndpoint: string;

    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.trafficEndpoint = join(configService.get("gov_api.url"), 'transport');
        this.regionEndpoint = join(configService.get("posstack.url"), 'reverse');
    }

    async getTrafficData(datetime?: Date) {
        // datetime format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // const currentDT = new Date().toISOString().split('.')[0];
        const params = {};
        if (datetime) {
            params['date_time'] = datetime;
        }

        const request = this.httpService.get<Traffic>(join(this.trafficEndpoint, 'traffic-images'), { params: params });

        const data = await firstValueFrom(
            request.pipe(
                map(res => res.data.items),
                catchError((error: AxiosError) => {
                    this.logger.error(error.response.data);
                    throw 'An error happened!';
                })
            )
        )
        if (data.length < 1) {
            return [];
        }
        
        return data;
    }

    reverseRegion(latitude: number, longitude: number) {
        return this.httpService.get<PosstackResponse>(
            join(this.regionEndpoint, 'traffic-images'),
            {
                params: {
                    access_key: this.configService.get('posstack.apikey'),
                    query: `${latitude},${longitude}`
                }
            }
        );
    }
}
