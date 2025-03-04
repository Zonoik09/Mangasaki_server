const Book = require('../models/Book');
const Friendship = require('../models/Friendship');
const Gallery = require('../models/Gallery');
const Recommendation = require('../models/Recommendation');
const Users = require('../models/User_Book');
const Logs = require('../models/User');
const Verification = require('../models/Verification');

const { validateUUID } = require('../middleware/validators');
const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const { Op } = require('sequelize');

const OLLAMA_API_URL = process.env.CHAT_API_OLLAMA_URL;
const DEFAULT_OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL;

/**
 * Lista los modelos de ollama disponibles.
 * @route GET /api/chat/models
 */
const listOllamaModels = async (req, res, next) => {
    try {

        log.createLog("DEBUG","MODELS","Se ha solicitado la lista de modelos de ollama")

        logger.info('Solicitando lista de modelos en Ollama');
        const response = await axios.get(`${OLLAMA_API_URL}/tags`);

        const models = response.data.models.map(model => ({
            name: model.name,
            modified_at: model.modified_at,
            size: model.size,
            digest: model.digest,
        }));

        logger.info('Modelos recuperados correctamente', { count: models.length });

        log.createLog("INFO","MODELS","Se recuperaron los modelos correctamente")

        res.status(200).json({
            status: 'OK',
            message: 'Modelos recuperados correctamente',
            data: {
                total_models: models.length,
                models,
            },
        });
    } catch (error) {

        log.createLog("ERROR","MODELS","Ha habido un error en el listado de modelos de ollama")

        logger.error('Error al recuperar modelos de Ollama', {
            error: error.message,
            url: `${OLLAMA_API_URL}/tags`,
        });

        if (error.response) {
            res.status(error.response.status).json({
                status: 'ERROR',
                message: 'No se pudieron recuperar los modelos',
                data: error.response.data,
            });
        } else {
            res.status(500).json({
                status: 'ERROR',
                message: 'Error interno al recuperar los modelos',
                data: null,
            });
        }
    }
};

module.exports = {
    listOllamaModels,
};
