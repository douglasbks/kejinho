require('dotenv').config();

export default {
  expo: {
    name: "Kejinho",
    slug: "kejinho",
    extra: {
      apiUrl: process.env.API_URL,
      phoneNumber: process.env.PHONE_NUMBER,
    },
  },
};