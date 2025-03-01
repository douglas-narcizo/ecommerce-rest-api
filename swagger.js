const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { PORT } = require('./config');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'E-commerce REST API',
            version: '1.0.7',
            description: `This is the starter point for an **E-commerce Server** based on the OpenAPI 3.0 specification.<br>
            It's part of a Portfolio Project on Codecademy's **Full Stack Engineer** career path.`,
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
