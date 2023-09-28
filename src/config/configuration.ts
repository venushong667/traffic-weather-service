const development = ({
    port: process.env.PORT ?? 8080,
    gov_api: {
        url: process.env.GOV_API_ENDPOINT ?? 'https://api.data.gov.sg/v1'
    },
    google_maps: {
        url: process.env.GOOGLE_MAPS_ENDPOINT ?? 'https://maps.googleapis.com/maps/api',
        apikey: process.env.GOOGLE_MAPS_API_KEY
    },
});

const production = ({
    port: process.env.PORT ?? 8080,
    gov_api: {
        url: process.env.GOV_API_ENDPOINT ?? 'https://api.data.gov.sg/v1'
    },
    google_maps: {
        url: process.env.GOOGLE_MAPS_ENDPOINT ?? 'https://maps.googleapis.com/maps/api',
        apikey: process.env.GOOGLE_MAPS_API_KEY
    },
});

export default () => {
    if (process.env.NODE_ENV !== 'prod') {
        return development;
    }
    return production;
}
