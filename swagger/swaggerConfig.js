const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CODEGROW',
      version: '1.0.0',
      description: 'NAM MÔ A DI ĐÀ PHẬT - XẢ XUI CỰC MẠNH',      
    },
    servers: [
      {
        url: process.env.SERVER_URL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], 
};
  
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;