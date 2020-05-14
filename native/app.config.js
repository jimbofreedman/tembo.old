export default {
  extra: {
    apiUrl: process.env.API_HOST,
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET,
    },
  },
};
