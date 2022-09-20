const config = require("../config/config");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Swagger test code from Ulan",
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
