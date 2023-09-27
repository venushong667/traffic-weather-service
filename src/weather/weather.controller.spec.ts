import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AreaForecast, DailyForecast, DateForecast, FutureForecast, HourlyForecast, Period } from './interfaces';

describe('WeatherController', () => {
    let weatherController: WeatherController;
    let weatherService: WeatherService;

    const mockConfigService = {
        gov_api: {
            url: 'gov_api_key'
        }
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forFeature(async () => (mockConfigService)),
                HttpModule
            ],
            controllers: [WeatherController],
            providers: [WeatherService],
        }).compile();

        weatherService = module.get<WeatherService>(WeatherService);
        weatherController = module.get<WeatherController>(WeatherController);
    });

    describe('findAll', () => {
        it('should return result of 2-hour forecast', async () => {
            const forecasts = [{
                area: 'area1',
                forecast: 'Windy'
            } satisfies AreaForecast];

            const result = [{
                update_timestamp: expect.any(String),
                timestamp: expect.any(String),
                valid_period: {
                    start: expect.any(String),
                    end: expect.any(String)
                },
                forecasts: expect.arrayContaining(forecasts)
            }] satisfies HourlyForecast[] as HourlyForecast[];

            jest.spyOn(weatherService, 'getWeatherForecast').mockImplementation(async () => result);
            
            expect(await weatherController.findAll('2-hour')).toEqual(result);

            expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('2-hour', undefined, undefined)
        });

        it('should return result of 24-hour forecast', async () => {
            const periods = [{
                time: {
                    start: expect.any(String),
                    end: expect.any(String)
                },
                regions: {
                    west: 'Windy'
                } 
            }] satisfies Period[] as Period[];

            const result = [{
                update_timestamp: expect.any(String),
                timestamp: expect.any(String),
                valid_period: {
                    start: expect.any(String),
                    end: expect.any(String)
                },
                periods: expect.arrayContaining(periods)
            }] as DailyForecast[];

            jest.spyOn(weatherService, 'getWeatherForecast').mockImplementation(async () => result);
            
            expect(await weatherController.findAll('24-hour')).toEqual(result);

            expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('24-hour', undefined, undefined)
        });
        
        it('should return result of 4-day forecast', async () => {
            const forecast1 = [{
                date: expect.any(String),
                forecast: expect.any(String),
                timestamp: expect.any(String),
                relative_humidity: {
                    low: expect.any(Number),
                    high: expect.any(Number),
                },
                temperature: {
                    low: expect.any(Number),
                    high: expect.any(Number),
                },
                wind: {
                    speed: {
                        low: expect.any(Number),
                        high: expect.any(Number),
                    },
                    direction: expect.any(String)
                }
            }] satisfies DateForecast[] as DateForecast[];

            const result = [{
                update_timestamp: expect.any(String),
                timestamp: expect.any(String),
                forecasts: expect.arrayContaining(forecast1)
            }] as FutureForecast[];

            jest.spyOn(weatherService, 'getWeatherForecast').mockImplementation(async () => result);
            
            expect(await weatherController.findAll('4-day')).toEqual(result);

            expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('4-day', undefined, undefined)
        });
    });
});
