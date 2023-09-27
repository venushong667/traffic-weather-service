import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { AreaMetadata, Duration, ForecastType } from './interfaces';


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

    getWeatherData<T extends Duration>(duration: T, datetime?: string, date?: string) {
        // date format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // date format: YYYY-MM-DD
        const params = {};
        if (datetime) {
            params['date_time'] = datetime;
        }
        if (date) {
            params['date'] = date;
        }
        return this.httpService.get<ForecastType<T>>(join(this.weatherEndpoint, `${duration}-weather-forecast`), { params: params });
    }

    async getWeatherForecast(duration: Duration = '2-hour', datetime?: string, date?: string) {
        return await firstValueFrom(
            this.getWeatherData(duration, datetime, date).pipe(
                map(res => res.data.items),
                catchError((error: AxiosError) => {
                    this.logger.error(error.response.data);
                    throw error;
                })
            )
        )
    }

    async getAreaMetadata() {
        return await firstValueFrom(
            this.getWeatherData('2-hour').pipe(
                map(res => res.data.area_metadata as AreaMetadata[]),
                catchError((error: AxiosError) => {
                    this.logger.error(error.response.data);
                    throw error;
                })
            )
        )
    }

}
