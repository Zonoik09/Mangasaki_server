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
 * @route POST /api/manga/analyzeManga
 */
const analyzeManga = async (req, res, next) => {
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

        // Mejoramos el prompt para asegurar que la respuesta esté siempre en formato JSON limpio
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
        **Ensure that the response is valid JSON, and contains no additional text, markdown, or formatting. Ensure no other characters or text are included before or after the JSON response.**`;

        // Generación de la respuesta desde Ollama
        const response = await generateResponse(prompt, [base64Image], CHAT_API_OLLAMA_MODEL);

        logger.debug('Respuesta cruda de Ollama:', response);

        // Limpiar cualquier texto no relacionado con el JSON
        const cleanResponse = response.replace(/^.*?(\{.*\})$/, '$1'); // Usamos una expresión regular para extraer solo el JSON válido

        let parsedResponse = JSON.parse(cleanResponse);

        logger.debug("Respuesta de Ollama procesada:", parsedResponse);

        // Procesar el tipo de respuesta recibido
        if (parsedResponse.type === "ISBN") {

            // Llamada a la función que busca el ISBN con reintentos
            const nameByISBN = await isbnSearch(parsedResponse.isbn_code);

            if (!nameByISBN) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No se pudo encontrar información para el ISBN después de varios intentos.',
                    data: null,
                });
            }

            const result = await nameSearch(nameByISBN);
            return res.status(201).json(buildResponse('OK', 'Análisis de portada de manga realizado correctamente', result));

        } else if (parsedResponse.type === "Manga Cover") {

            let result = await nameSearch(parsedResponse.manga_name + " ,Vol. " + parsedResponse.volume);

            logger.info("Información del manga:", JSON.stringify(result, null, 2));

            return res.status(201).json(buildResponse('OK', 'Análisis de portada de manga realizado correctamente', result));

        } else {

            return res.status(400).json({
                status: 'ERROR',
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

const isbnSearch = async (isbn) => {
    try {
        logger.debug(`Buscando información del ISBN: ${isbn}`);

        // Realizamos la solicitud a la API para obtener la información del ISBN
        const response = await axios.get(`${ISBN_URL}${isbn}`, {
            headers: { 'Authorization': ISBN_API_KEY }
        });

        // Verificar si la respuesta contiene los datos del libro
        if (response.data && response.data.book) {
            logger.debug('Información obtenida para el ISBN');
            
            // Retornar el título del libro (usando title_long si está disponible)
            return response.data.book.title_long || response.data.book.title;
        }

        // Si no se encuentra la información, retornamos un mensaje de error
        logger.warn(`No se encontró información para el ISBN`);
        return { status: 'ERROR', message: 'No se encontró información para el ISBN', data: null };

    } catch (error) {
        // Si ocurre un error durante la búsqueda
        logger.error('Error en la búsqueda de ISBN', {
            error: error.message,
            isbn: isbn
        });
        return { status: 'ERROR', message: 'Error al obtener información del ISBN', data: null };
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
    analyzeManga,
};
