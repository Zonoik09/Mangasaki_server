const Book = require('../models/Book');
const Gallery = require('../models/Gallery');
const Recommendation = require('../models/Recommendation');
const User_Book = require('../models/User_Book');
const User = require('../models/User');

const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const { Op } = require('sequelize');

const OLLAMA_API_URL = process.env.CHAT_API_OLLAMA_URL;
const CHAT_API_OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL;

/**
 * Lista los modelos de ollama disponibles.
 * @route GET /api/book/analyzeBook
 */
const analyzeBook = async (req, res, next) => {
    try {

        logger.info('Solicitando lista de modelos en Ollama');
        const response = await axios.get(`${OLLAMA_API_URL}/tags`);

        const models = response.data.models.map(model => ({
            name: model.name,
            modified_at: model.modified_at,
            size: model.size,
            digest: model.digest,
        }));

        logger.info('Modelos recuperados correctamente', { count: models.length });

        res.status(200).json({
            status: 'OK',
            message: 'Modelos recuperados correctamente',
            data: {
                total_models: models.length,
                models,
            },
        });
    } catch (error) {

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
    analyzeBook,
};
