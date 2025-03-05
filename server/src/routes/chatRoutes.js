const express = require('express');
const router = express.Router();
const {
    listOllamaModels,
} = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat/models:
 *   get:
 *     summary: Lista los modelos disponibles en Ollama
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Lista de modelos disponibles
 *       500:
 *         description: Error al recuperar modelos
 */
router.get('/models', listOllamaModels);

module.exports = router;
