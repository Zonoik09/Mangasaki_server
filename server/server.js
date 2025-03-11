// Importaciones principales
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const errorHandler = require('./src/middleware/errorHandler');

const adminRoutes = require('./src/routes/adminRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const socialRoutes = require('./src/routes/socialRoutes');
const userRoutes = require('./src/routes/userRoutes');
const validationRoutes = require('./src/routes/validationRoutes');

const { sequelize } = require('./src/config/database');

const User = require('./src/models/User');
const Book = require('./src/models/Book');
const Friendship = require('./src/models/Friendship');
const Gallery = require('./src/models/Gallery');
const Recommendation = require('./src/models/Recommendation');
const User_Book = require('./src/models/User_Book');
const Verification = require('./src/models/Verification');

const { logger, expressLogger } = require('./src/config/logger');
// Crear instància d'Express
const app = express();

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use((req, res, next) => {
    logger.info('Petició HTTP rebuda', {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.debug("DEBUG","SERVER","Petición HTTP recibida")
    next();
});

app.use(expressLogger);

app.use('/api/admin', adminRoutes);
app.use('/api/manga', bookRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/user', userRoutes);
app.use('/api/validation', validationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info('Base de dades connectada', {
            host: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT
        });

        await sequelize.sync({
            force: true,
        });

        logger.info('Models sincronitzats', {
            force: true,
            timestamp: new Date().toISOString()
        });

        createAdminUser()

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, '0.0.0.0', () => {
            logger.info('Servidor iniciat correctament', {
                port: PORT,
                mode: process.env.NODE_ENV,
                docs: `http://127.0.0.1:${PORT}/api-docs`
            });
        });

        logger.debug(`Servidor iniciado correctamente en: http://127.0.0.1:${PORT}/api-docs`)
        
    } catch (error) {
        logger.error('Error fatal en iniciar el servidor', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        logger.debug("Error fatal en iniciar el servidor")

        process.exit(1);

    }
}

process.on('unhandledRejection', (error) => {
    logger.error('Error no controlat detectat', {
        error: error.message,
        stack: error.stack,
        type: 'UnhandledRejection',
        timestamp: new Date().toISOString()
    });

    logger.debug("SERVER","Error no controlado detectado")

    process.exit(1);
});

process.on('SIGTERM', () => {
    logger.info('Senyal SIGTERM rebut. Tancant el servidor...');

    logger.info("Señal SIGTERM recibido. Cerrando el servidor...")

    process.exit(0);
});

async function createAdminUser() {
    try {
        if (process.env.CREATE_ADMIN_USER !== 'true') {
            logger.info('No se creará el usuario administrador, variable CREATE_ADMIN_USER no está configurada como "true"');
            return;
        }

        const userExists = await User.findOne({ where: { nickname: process.env.NICKNAME } });

        if (!userExists) {
            await User.create({
                nickname: process.env.NICKNAME,
                password: process.env.PASSWORD,
                phone: process.env.PHONE,
                token: process.env.TOKEN,
            });

            logger.info('Usuario administrador creado correctamente');
        } else {
            logger.info('El usuario administrador ya existe');
        }
    } catch (error) {
        logger.error('Error al crear el usuario administrador', {
            error: error.message,
            stack: error.stack,
        });
    }
}

startServer();

module.exports = app;
