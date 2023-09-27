import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    await app.listen(process.env.PORT || 8080);
}
bootstrap();
