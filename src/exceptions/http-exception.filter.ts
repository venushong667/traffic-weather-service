import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AxiosError } from 'axios';
  
  @Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;
  
        const ctx = host.switchToHttp();
        
        let httpStatus: number;
        let errorResponse: string | object;

        if (exception instanceof HttpException) {
            httpStatus = exception.getStatus()
            errorResponse = exception.getResponse()
        } else if (exception instanceof AxiosError) {
            httpStatus = exception.response.status
            errorResponse = exception.response.data
        } else {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
            errorResponse = { message: "Something's wrong" }
        }

        const responseBody = {
            statusCode: httpStatus,
            response: errorResponse,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };
  
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}