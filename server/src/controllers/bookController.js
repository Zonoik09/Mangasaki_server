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

        logger.info("Se recibió una petición de análisis de libro");

        if (!base64Image) {           
            return res.status(400).json({
                status: 'ERROR',
                message: 'El campo base64Image es obligatorio',
                data: null,
            });
        }

        const prompt = `
        Identify whether the input is an ISBN code or the cover of a manga. Respond **only** with a valid JSON object, following the exact structure below. Do not include explanations, text, or code block delimiters. The response must be **only JSON**.
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

        logger.debug(response);

        let parsedResponse = JSON.parse(response);

        logger.debug("Respuesta de Ollama: ", parsedResponse);

        if (parsedResponse.type === "ISBN") {

            // Llamar a la nueva función con reintentos
            const nameByISBN = await isbnSearchWithRetry(parsedResponse.isbn_code);

            // Si no se obtiene respuesta válida después de 3 intentos, devolver error
            if (!nameByISBN || !nameByISBN.items || nameByISBN.items.length === 0) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No se pudo encontrar información para el ISBN después de varios intentos.',
                    data: null,
                });
            }

            const result = await nameSearch(nameByISBN.items[0].volumeInfo.title);
            return res.status(201).json(buildResponse('OK', 'Análisis de portada de manga realizado correctamente', result));

        } else if (parsedResponse.type === "Manga Cover") {

            let result = await nameSearch(parsedResponse.manga_name + " ,Vol. " + parsedResponse.volume);

            logger.info("Información del manga: " + JSON.stringify(result, null, 2));

            return res.status(201).json(buildResponse('OK', 'Análisis de portada de manga realizado correctamente', result));

        } else {

            return res.status(400).json({
                status: 'Error',
                message: 'Tipo de respuesta no reconocido',
            });
        }

    } catch (error) {

        logger.error('Error al registrar el prompt con imágenes', {
            error: error.message,
            stack: error.stack,
        });

        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al registrar el prompt con imágenes',
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

const isbnSearchWithRetry = async (isbn, retries = 3) => {
    try {
        let attempt = 0;
        let response;

        while (attempt < retries) {
            attempt++;
            logger.debug(`Intento ${attempt} para buscar información del ISBN: ${isbn}`);
            
            response = await axios.get(`${ISBN_URL}${isbn}`, {
                headers: { 'Authorization': ISBN_API_KEY }
            });

            // Verificar si la respuesta contiene datos
            if (response.data && response.data.items && response.data.items.length > 0) {
                logger.debug('Información obtenida para el ISBN en intento ' + attempt);
                return response.data; // Devuelve los datos si se encuentra información
            }

            logger.warn(`No se encontró información para el ISBN en el intento ${attempt}`);
            
            // Si la respuesta es inválida, esperar antes de reintentar
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos entre intentos
            }
        }

        // Si después de los reintentos no se obtiene respuesta, pedir a Ollama que analice de nuevo
        logger.warn('No se encontró información después de 3 intentos. Volveré a intentar con Ollama.');
        return await handleOllamaAnalysis(isbn);  // Aquí se hace el análisis con Ollama

    } catch (error) {
        logger.error('Error en la búsqueda de ISBN', {
            error: error.message,
            isbn: isbn
        });
        return { status: 'ERROR', message: 'Error al obtener información del ISBN', data: null };
    }
};

const handleOllamaAnalysis = async (isbn) => {
    try {
        logger.debug('Solicitando a Ollama el análisis del ISBN');

        const prompt = `
        Identificar si el código ingresado es un código ISBN válido y proporcionar la información correspondiente.
        Responder solo con un objeto JSON válido, siguiendo la estructura indicada a continuación. No incluir explicaciones, texto o delimitadores de bloques de código.
        
        Respuesta:
        {
            "type": "ISBN",
            "isbn_code": "El código ISBN",
            "title": "Título del libro",
            "authors": "Autores del libro",
            "publisher": "Editorial",
            "publishedDate": "Fecha de publicación",
            "description": "Descripción del libro"
        }
        `;

        // Ejecutar la solicitud a Ollama con el ISBN
        const response = await generateResponse(prompt, [isbn], CHAT_API_OLLAMA_MODEL);

        // Parsear la respuesta y devolverla
        const parsedResponse = JSON.parse(response);
        logger.debug('Respuesta de Ollama: ', parsedResponse);

        // Devolver la respuesta de Ollama
        return parsedResponse;

    } catch (error) {
        logger.error('Error al obtener información de Ollama', {
            error: error.message,
            isbn: isbn
        });
        return { status: 'ERROR', message: 'Error al obtener información de Ollama', data: null };
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
