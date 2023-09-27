import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Duration, isDuration } from './interfaces';

@Controller('weather')
export class WeatherController {
    private readonly logger = new Logger(WeatherController.name);
    constructor(private readonly weatherService: WeatherService) {}

    @Get()
    async findAll(
        @Query('duration') duration: Duration,
        @Query('date_time') datetime?: string,
        @Query('date') date?: string
    ) {
        // date_time format: YYYY-MM-DD[T]HH:mm:ss (SGT)
        // date format: YYYY-MM-DD
        try {
            if (!isDuration(duration)) {
                throw new BadRequestException("Invalid duration. Supporting 2-hour, 24-hour or 4-day only")
            }

            return await this.weatherService.getWeatherForecast(duration, datetime, date);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
    
}
