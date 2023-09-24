import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { APIStatus, Coordinate } from 'src/geo/geo.service';


export type Duration = '2-hour' | '24-hour' | '4-day'

export interface HourForecastData {
    area_metadata: AreaMetadata[],
    items: HourItem[],
    api_info: APIStatus,
}

export interface AreaMetadata {
    name: string,
    label_location: Coordinate
}

export interface HourItem {
    update_timestamp: string,
    timestamp: string,
    valid_period: {
        start: string,
        end: string
    }
    forecasts: Forecast[]
}

export interface Forecast {
    area: string,
    forecast: string
}

@Injectable()
export class WeatherService {
    private readonly logger = new Logger(WeatherService.name);
    private weatherEndpoint: string;

    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.weatherEndpoint = join(configService.get("gov_api.url"), 'environment');
    }

    getWeatherForecast(duration: Duration = '2-hour', datetime?: Date, date?: string) {
        // date format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // date format: YYYY-MM-DD
        const params = {};
        if (datetime) {
            params['date_time'] = datetime;
        }
        if (date) {
            params['date'] = date;
        }
        return this.httpService.get(join(this.weatherEndpoint, `${duration}-weather-forecast`), { params: params });
    }

    async getAreaMetadata() {
        return await firstValueFrom(
            this.getWeatherForecast().pipe(
                map(res => res.data.area_metadata as AreaMetadata[]),
                catchError((error: AxiosError) => {
                    this.logger.error(error.response.data);
                    throw 'An error happened!';
                })
            )
        )
    }

}
