const Book = require('../models/Book');
const Gallery = require('../models/Gallery');
const Recommendation = require('../models/Recommendation');
const User_Book = require('../models/User_Book');
const User = require('../models/User');

const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const { Logger } = require('winston');
const Tesseract = require('tesseract.js');

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

        logger.info("Se recibió una petición de análisis de libro");

        if (!base64Image) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El campo base64Image es obligatorio',
                data: null,
            });
        }

        // Preprocesamiento de la imagen para mejorar la calidad (por ejemplo, aumentando el contraste)
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // Usamos Tesseract.js para el análisis de la imagen
        const text = await extractTextFromImage(imageBuffer);
        logger.debug("Texto extraído de la imagen: ", text);

        // Intentar identificar el ISBN
        const isbn = extractISBN(text);

        if (isbn) {
            logger.info(`ISBN encontrado: ${isbn}`);
            const nameByISBN = await isbnSearch(isbn);
            const result = await nameSearch(nameByISBN.book.title_long);

            return res.status(201).json(buildResponse('OK', 'Análisis de libro realizado correctamente', result));
        } else {
            logger.warn("No se encontró un ISBN, verificando si es una portada de manga...");
            const prompt = `Identify whether the input is an ISBN code or the cover of a manga. Respond **only** with a valid JSON object...`;

            const response = await generateResponse(prompt, [base64Image], CHAT_API_OLLAMA_MODEL);
            let parsedResponse = JSON.parse(response);

            logger.debug("Respuesta de Ollama: ", parsedResponse);

            if (parsedResponse.type === "ISBN") {
                const nameByISBN = await isbnSearch(parsedResponse.isbn_code);
                const result = await nameSearch(nameByISBN.book.title_long);
                return res.status(201).json(buildResponse('OK', 'Análisis de libro realizado correctamente', result));
            } else if (parsedResponse.type === "Manga Cover") {
                let result = await nameSearch(parsedResponse.manga_name + " ,Vol. " + parsedResponse.volume);
                logger.info("Información del manga: " + JSON.stringify(result, null, 2));
                return res.status(201).json(buildResponse('OK', 'Análisis de portada de manga realizado correctamente', result));
            } else {
                res.status(400).json({
                    status: 'Error',
                    message: 'Tipo de respuesta no reconocido',
                });
            }
        }
    } catch (error) {
        logger.error('Error al registrar el prompt con imágenes', {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al registrar el prompt con imágenes',
            data: null,
        });
    }
};

/**
 * Usamos Tesseract.js para extraer texto de una imagen
 */
const extractTextFromImage = async (imageBuffer) => {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(
            imageBuffer,
            'eng', // Lenguaje inglés
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            resolve(text);
        }).catch(err => {
            reject(err);
        });
    });
};

/**
 * Extrae el ISBN del texto utilizando expresiones regulares
 */
const extractISBN = (text) => {
    const isbnRegex = /(?:ISBN(?:-13)?:? )?(\d{3})?[- ]?(\d{1,5})[- ]?(\d{1,7})[- ]?(\d{1,7})[- ]?(\d{1,7})/;
    const match = text.match(isbnRegex);
    if (match) {
        const isbn = match[0].replace(/[^0-9X]/g, ''); // Eliminar caracteres no numéricos.
        if (isbn.length === 10 || isbn.length === 13) {
            return isbn;
        }
    }
    return null;
};

const generateResponse = async (prompt, images, model) => {
    try {
        logger.debug('Iniciando generación de respuesta de un libro...');
        const requestBody = {
            model,
            prompt,
            stream: false,
            images,
        };

        const response = await axios.post(`${OLLAMA_API_URL}/generate`, requestBody, {
            timeout: 30000,
            responseType: 'json',
        });

        logger.debug('Respuesta generada correctamente', {
            responseLength: response.data.response.length,
        });

        return response.data.response.trim();
    } catch (error) {
        logger.error('Error en la generación de respuesta', {
            error: error.message,
            model: CHAT_API_OLLAMA_MODEL,
            stream: false,
        });

        return 'Lo siento, no he podido generar una respuesta en este momento.';
    }
};

const isbnSearch = async (isbn) => {
    try {
        logger.debug(`Buscando información para ISBN: ${isbn}`);
        const response = await axios.get(`${ISBN_URL}${isbn}`, {
            headers: {
                'Authorization': ISBN_API_KEY,
            },
        });

        if (!response.data) {
            throw new Error('No se encontró información para este ISBN');
        }

        logger.debug('Respuesta recibida de la API', { data: response.data });
        return response.data;
    } catch (error) {
        logger.error('Error en la búsqueda de ISBN', {
            error: error.message,
            isbn: isbn,
        });

        return {
            status: 'ERROR',
            message: 'Error al obtener información del ISBN',
            data: null,
        };
    }
};

const nameSearch = async (name) => {
    try {
        logger.debug('Inicialización de respuesta con nombre: ' + name);
        const response = await axios.get(MANGA_NAME_URL + name);

        if (!response.data) {
            throw new Error('No se encontró información para este manga');
        }

        logger.debug('Respuesta recibida de la API', {
            data: response.data.items[0],
        });

        return response.data.items[0];
    } catch (error) {
        logger.error('Error en la búsqueda del manga', {
            error: error.message,
            name: name,
        });

        return {
            status: 'ERROR',
            message: 'Error al obtener información del manga',
            data: null,
        };
    }
};

const buildResponse = (status, message, result) => {
    return {
        status,
        message,
        data: {
            title: result.volumeInfo.title || 'No disponible',
            authors: result.volumeInfo.authors || 'No disponible',
            publisher: result.volumeInfo.publisher || 'No disponible',
            publishedDate: result.volumeInfo.publishedDate || 'No disponible',
            description: result.volumeInfo.description || 'No disponible',
            pageCount: result.volumeInfo.pageCount || 'No disponible',
            categories: result.volumeInfo.categories || 'No disponible',
            averageRating: result.volumeInfo.averageRating || 'No disponible',
            imageLinks: result.volumeInfo.imageLinks || 'No disponible',
        },
    };
};

module.exports = {
    analyzeBook,
};
