const Book = require('../models/Book');
const Gallery = require('../models/Gallery');
const Recommendation = require('../models/Recommendation');
const User_Book = require('../models/User_Book');
const User = require('../models/User');

const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const { Logger } = require('winston');

const OLLAMA_API_URL = process.env.CHAT_API_OLLAMA_URL;
const CHAT_API_OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL;

const ISBN_API_KEY = process.env.ISBN_API_KEY;
const ISBN_URL = process.env.ISBN_URL;

const MANGA_NAME_URL = process.env.MANGA_NAME_URL;

/**
 * Hace una petición con imagen.
 * @route POST /api/book/analyzeBook
 */
const analyzeBook = async (req, res, next) => {
    try {

        const { base64Image } = req.body;

        logger.info("Se recibió una petición de análisis de libro")

        if ( !base64Image ) {           
            return res.status(400).json({
                status: 'ERROR',
                message: 'El campo base64Image es obligatorio',
                data: null,
            });
        }

        const prompt = 
        `Identify whether the input is an ISBN code or the cover of a manga. Respond **only** with a valid JSON object, following the exact structure below. Do not include explanations, text, or code block delimiters. The response must be **only JSON**.
        If it's an ISBN code, return:
        {
            "type": "ISBN",
            "isbn_code": "The ISBN code"
        }

        If it's a manga cover, return:
        {
            "type": "Manga Cover",
            "manga_name": "The name of the manga",
            "volume": "The volume number"
        }
        **Ensure that the response is valid JSON and contains no additional text, markdown, or formatting.**`;

        const response = await generateResponse(prompt, [base64Image], CHAT_API_OLLAMA_MODEL);

        let parsedResponse = JSON.parse(response);

        logger.debug("Respuesta de Ollama: ", parsedResponse);

        if (parsedResponse.type === "ISBN") {

            nameByISBN = isbnSearch(parsedResponse.isbn_code);

            result = nameSearch(nameByISBN.book.title_long);
            
            res.status(201).json({
                status: 'OK',
                message: 'Análisis de ISBN realizado correctamente',
                data: {
                    title: result.title,
                    authors: result.authors,
                    publisher: result.authors,
                    publishedDate: result.publishedDate,
                    description: result.description,
                    pageCount: result.pageCount,
                    categories: result.categories,
                    averageRating: result.averageRating,
                    imageLinks: result.imageLinks
                },
            });

        } else if (parsedResponse.type === "Manga Cover") {

            let result = nameSearch(parsedResponse.manga_name + " ,Vol. " + parsedResponse.volume);

            logger.info("Información del manga: " + result)

            res.status(201).json({
                status: 'OK',
                message: 'Análisis de portada de manga realizado correctamente',
                data: {
                    title: result.title,
                    authors: result.authors,
                    publisher: result.authors,
                    publishedDate: result.publishedDate,
                    description: result.description,
                    pageCount: result.pageCount,
                    categories: result.categories,
                    averageRating: result.averageRating,
                    imageLinks: result.imageLinks
                },
            });

        } else {

            res.status(400).json({
                status: 'Error',
                message: 'Tipo de respuesta no reconocido',
            });
        }

    } catch (error) {

        logger.error('Error al registrar el prompt con imagenes', {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al registrar el prompt con imagenes',
            data: null,
        });
    }
};

const generateResponse = async (prompt, images, model) => {
    try {

        logger.debug('Iniciando generación de respuesta de un libro...');

        const requestBody = {
            model,
            prompt,
            stream: false,
            images
        };

        const response = await axios.post(`${OLLAMA_API_URL}/generate`, requestBody, {
            timeout: 30000,
            responseType: 'json'
        });

        logger.debug('Respuesta generada correctamente', {
            responseLength: response.data.response.length
        });
        return response.data.response.trim();
    } catch (error) {
        logger.error('Error en la generación de respuesta', {
            error: error.message,
            model: CHAT_API_OLLAMA_MODEL,
            stream: false
        });

        return 'Lo siento, no he podido generar una respuesta en este momento.';
    }
};

const isbnSearch = async (isbn) => {
    try {
        logger.debug(`Buscando información para ISBN: ${isbn}`);
        
        const response = await axios.get(`${ISBN_URL}${isbn}`, {
            headers: {
                'Authorization': ISBN_API_KEY
            }
        });

        // Verificar que la respuesta contiene datos
        if (!response.data) {
            throw new Error('No se encontró información para este ISBN');
        }

        logger.debug('Respuesta recibida de la API', {
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Error en la búsqueda de ISBN', {
            error: error.message,
            isbn: isbn
        });

        // Retornar un mensaje de error adecuado en caso de falla
        return {
            status: 'ERROR',
            message: 'Error al obtener información del ISBN',
            data: null
        };
    }
};

const nameSearch = async (name) =>  {
    try {
        logger.debug('Inicialización de respuesta con nombre: ' + name);
        
        const response = await axios.get(MANGA_NAME_URL + name);

        // Verificar si la respuesta contiene datos
        if (!response.data) {
            throw new Error('No se encontró información para este manga');
        }

        logger.debug('Respuesta recibida de la API', {
            data: response.data.items[0]
        });

        return response.data.items[0];

    } catch (error) {
        logger.error('Error en la búsqueda del manga', {
            error: error.message,
            name: name
        });

        // Retornar un mensaje de error adecuado en caso de falla
        return {
            status: 'ERROR',
            message: 'Error al obtener información del manga',
            data: null
        };
    }
};

module.exports = {
    analyzeBook,
};
