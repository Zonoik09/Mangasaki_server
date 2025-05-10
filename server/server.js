const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt'); // Sirve para encriptar la contraseña del usuario
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const errorHandler = require('./src/middleware/errorHandler');
const { logger, expressLogger } = require('./src/config/logger');
const { sequelize } = require('./src/config/database');

// Importaciones de rutas
const mangaRoutes = require('./src/routes/mangaRoutes');
const socialRoutes = require('./src/routes/socialRoutes');
const userRoutes = require('./src/routes/userRoutes');
const validationRoutes = require('./src/routes/validationRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes.js');

// Importaciones de modelos
const Book_Scan_Request = require('./src/models/Book_Scan_Request.js');
const Friendship = require('./src/models/Friendship');
const Gallery = require('./src/models/Gallery');
const Gallery_Manga = require('./src/models/Gallery_Manga.js');
const User_Manga = require('./src/models/User_Manga');
const User = require('./src/models/User');
const Verification = require('./src/models/Verification');

const Notification_Friend_Request = require('./src/models/Notification_Friend_Request.js');
const Notification_Friend = require('./src/models/Notification_Friend.js');
const Notification_Like = require('./src/models/Notification_Like.js');
const Notification_Recommendation = require('./src/models/Notification_Recommendation.js');

const { hash } = require('crypto');

// Crear instancia de Express
const app = express();
const server = http.createServer(app);

const WebSockets = require('./src/webSockets/utilsWebSockets.js');
const ServerLogic = require('./src/webSockets/serverLogic.js');

const webSocketManager = new WebSockets();

const PORT = process.env.PORT || 3000;

webSocketManager.init(server, PORT);

const socketLogic = new ServerLogic(webSocketManager);

// Configuración de middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuración de documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middleware de logging
app.use((req, res, next) => {
    logger.info('Petició HTTP rebuda', {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.debug("Petición HTTP recibida");
    next();
});

app.use(expressLogger);

// Configuración de rutas
app.use('/api/manga', mangaRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/user', userRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/gallery', galleryRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Función para iniciar el servidor
async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info('Base de dades connectada', {
            host: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT
        });

        await sequelize.sync({ force: false });
        logger.info('Models sincronitzats', {
            force: false,
            timestamp: new Date().toISOString()
        });

        createAdminUser();

        server.listen(PORT, '0.0.0.0', () => {
            logger.info('Servidor iniciat correctament', {
                port: PORT,
                mode: process.env.NODE_ENV,
                docs: `http://127.0.0.1:${PORT}/api-docs`
            });
        });

        logger.info('Servidor WebSocket iniciat correctament');

        logger.debug(`Servidor iniciado correctamente en: http://127.0.0.1:${PORT}/api-docs`);
    } catch (error) {
        logger.error('Error fatal en iniciar el servidor', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        logger.debug("Error fatal en iniciar el servidor");
        process.exit(1);
    }
}

// Manejo de eventos del proceso
process.on('unhandledRejection', (error) => {
    logger.error('Error no controlat detectat', {
        error: error.message,
        stack: error.stack,
        type: 'UnhandledRejection',
        timestamp: new Date().toISOString()
    });

    logger.debug("SERVER", "Error no controlado detectado");
    process.exit(1);
});

process.on('SIGTERM', () => {
    logger.info('Cerrando WebSocket y servidor...');
    webSocketManager.end(); // Cierra el WebSocket server correctamente
    server.close(() => process.exit(0));
});

// Función para crear usuario administrador
async function createAdminUser() {
    try {
        if (process.env.CREATE_ADMIN_USER !== 'true') {
            logger.info('No se creará el usuario administrador, variable CREATE_ADMIN_USER no está configurada como "true"');
            return;
        }

        const userExists = await User.findOne({ where: { nickname: process.env.NICKNAME } });
        
        const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 12); //2^12 = 4096 iteraciones
        
        if (!userExists) {
            await User.create({
                nickname: process.env.NICKNAME,
                password: hashedPassword,
                phone: process.env.PHONE,
                token: process.env.TOKEN,
                image_url: null,
                banner_url: null,
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

// Iniciar servidor
startServer();

module.exports = app;
