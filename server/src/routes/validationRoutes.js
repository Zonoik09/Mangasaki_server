const express = require('express');
const router = express.Router();
const {
    analyzeManga,
} = require('../controllers/mangaController.js');

/**
 * @swagger
 * /api/manga/analyzeManga:
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
router.post('/analyzeManga', analyzeManga);

module.exports = router;
