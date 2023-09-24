const development = ({
    port: process.env.PORT ?? 8080,
    gov_api: {
        url: process.env.GOV_API_ENDPOINT ?? 'https://api.data.gov.sg/v1'
    },
    posstack: {
        url: process.env.POSSTACK_API_ENDPOINT ?? 'http://api.positionstack.com/v1',
        apikey: process.env.POSSTACK_API_KEY ?? 'ce5797dee28978b7fd79aefc4dc26a93'
    }
});

const production = ({
    port: process.env.PORT ?? 8080,
    gov_api: {
        url: process.env.GOV_API_ENDPOINT ?? 'https://api.data.gov.sg/v1'
    },
    posstack: {
        url: process.env.POSSTACK_API_ENDPOINT ?? 'http://api.positionstack.com/v1',
        apikey: process.env.POSSTACK_API_KEY ?? 'ce5797dee28978b7fd79aefc4dc26a93'
    }
});

export default () => {
    if (process.env.NODE_ENV !== 'prod') {
        return development;
    }
    return production;
}
