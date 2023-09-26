import { Controller, Get, Query } from '@nestjs/common';
import { Duration, WeatherService } from './weather.service';
import { firstValueFrom } from 'rxjs';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @Get()
    async findAll(
        @Query('duration') duration: Duration,
        @Query('date_time') datetime?: string,
        @Query('date') date?: string
    ) {
        // date_time format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // date format: YYYY-MM-DD
        
        return await this.weatherService.getWeatherForecast(duration, datetime, date);
    }
    
}
