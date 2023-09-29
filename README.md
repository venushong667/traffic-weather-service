# weather-traffic-nest
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Getting Started

### Installation

Install required packages.
```bash
$ npm install
```

Create database schema in postgres. (Make sure db server is up)
```bash
npx prisma db push
```

Generate table model in prisma client.
```bash
npx prisma generate
```

### Running the app locally

In order to run the server locally, please fill in your `google_maps.apikey` in `/config/configuration.ts` to prevent any issue. Guidance of getting API key is in later section.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test
```

### Build docker image

In the project directory, run command

```bash
docker build -t traffic-weather .
```

The docker image should start building with tag `traffic-weather:latest` locally.
After image is built, please refer to the `docker-compose.yml` provided in this repo for easy startup.

### Run Docker compose

Make use the required environment variable such as `GOOGLE_MAP_API_KEY` is provided. Run command.

```bash
docker-compose up -d
```

## Google Maps API

This service is make use of Google Maps API to perform reverse geocoding. Hence the api key is required. (Don't worry it is free for this service usage.)

Please follow the [steps](https://developers.google.com/maps/documentation/javascript/get-api-key) in `Create API keys` section to generate Geocoding API key.

If there is any issue with the key generation, please let me know and I would provide the dummy key.


## Architecture 

This service is make use of the following stack:
- Nest.js
- Prisma with PostgreSQL

**Nest.js** provide a comprehensive components including testing, exception filters, configuration module and ORM integration other than just API server. This feature achieve the better readability and maintainability compare to the barebone library such as express or fastify.

**Prisma** is simplicity over other ORM such as TypeORM or Sequelize, it provide schema generation, migration and entity models from their powerful CLI, which make things much cleaner to take care of.