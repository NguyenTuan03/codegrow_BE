const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your Project API',
      version: '1.0.0',
      description: 'Documentation for your Node.js API',
    },
    servers: [
      {
        url: 'http://localhost:8888',
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