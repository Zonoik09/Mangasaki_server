const express = require('express');
const router = express.Router();
const {
    analyzeBook,
    getPrevisualization,
} = require('../controllers/bookController.js');

/**
 * @swagger
 * /api/manga/analyzeBook:
 *   post:
 *     summary: Analiza un libro basado en una imagen en Base64
 *     tags: [Manga]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64Image:
 *                 type: string
 *                 description: Imagen codificada en Base64 para analizar
 *                 example: "iVBORw0KGgoAAAANSUhEUgAA..."
 *     responses:
 *       200:
 *         description: Análisis exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Libro analizado correctamente"
 *       400:
 *         description: Datos inválidos o incompletos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/analyzeBook', analyzeBook);

/**
 * @swagger
 * /api/manga/previsualization:
 *   get:
 *     summary: Obtiene tres listas de las vistas de información de mangas [ top manags , recomendaciones , 3 categorias ]
 *     tags: [Manga]
 *     responses:
 *       200:
 *         description: Listado de información de mangas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Lista de mangas obtenida correctamente"
 *                 top_mangas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Jujutsu Kaisen"
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       image_url:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.get('/previsualization', getPrevisualization);

module.exports = router;
