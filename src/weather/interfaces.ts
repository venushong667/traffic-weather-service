import { APIStatus, Coordinate } from "src/geo/geo.service"

// 2-hour

export interface HourlyForecastData {
    area_metadata: AreaMetadata[]
    items: HourlyForecast[]
    api_info: APIStatus
}

export interface AreaMetadata {
    name: string
    label_location: Coordinate
}

export interface HourlyForecast {
    update_timestamp: string
    timestamp: string
    valid_period: {
        start: string
        end: string
    }
    forecasts: AreaForecast[]
}

export interface AreaForecast {
    area: string
    forecast: string
}

// 24-hour
export interface DailyForecastData {
    items: DailyForecast[]
    api_info: APIStatus
}

export interface DailyForecast {
    update_timestamp: string
    timestamp: string
    valid_period: { start: string, end: string }
    general: Observation
    periods: Period[]
}

export interface Observation {
    forecast: string
    relative_humidity: { low: number, high: number }
    temperature: { low: number, high: number }
    wind: { 
        speed: { low: number, high: number }
        direction: string
    }
}

export interface Period {
    time: { start: string, end: string }
    regions: {
        [region: string]: string
    }
}

// 4-day
export interface FutureForecastData {
    items: FutureForecast[]
    api_info: APIStatus
}


export interface FutureForecast {
    update_timestamp: string
    timestamp: string
    forecasts: DateForecast[]
}

export interface DateForecast extends Observation {
    date: string
    forecast: string
    timestamp: string
}


export type Duration = '2-hour' | '24-hour' | '4-day'

export type ForecastType<T> = 
    T extends "2-hour" ? HourlyForecastData :
    T extends "24-hour" ? DailyForecastData :
    T extends "4-hour" ? FutureForecastData :
    never;
