export default {
  extra: {
    apiUrl: process.env.TEMPLATE_API_HOST || 'http://localhost:8000',
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || 'DTCMOZ0paZooZCgNvwUKs3AdpjENSRCNaURwvk2f',
      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET ||
        'OSc9Mxp2DsG0aE0DOI98XTg21a3SFjDBVhm3FmNbWq5SSGgRJlF1xanSoGM6QeEgmY2S6xzWx4bDRBV17dNLhYM6Bet0SgtWLBrfGOF3awK4n87aFiSypOFaaFUzLeIO',
    },
  },
};
