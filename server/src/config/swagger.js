const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MANGASAKI API',
            version: '1.0.0',
            description: 'API per gestionar projecte de Mangasaki'
        },
        servers: [
            {
                url: 'https://mangasaki.ieti.site',
                description: 'Servidor de desenvolupament'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

module.exports = swaggerJsDoc(swaggerOptions);
