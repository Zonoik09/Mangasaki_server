const express = require('express');
const router = express.Router();
const {
    analyzeBook,

} = require('../controllers/bookController');
/**
 * @swagger
 * /api/book/analyzeBook:
 *   post:
 *     summary: Analiza un libro a partir de una cadena base64
 *     tags: [Book]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: bookImage
 *         description: Cadena base64 de la imagen del libro que se desea analizar
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             base64Image:
 *               type: string
 *               description: Imagen del libro codificada en base64
 *               example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *     responses:
 *       200:
 *         description: Resultado del análisis del libro
 *       400:
 *         description: Error en la solicitud (por ejemplo, si no se proporciona la imagen)
 *       500:
 *         description: Error interno al procesar la imagen
 */
router.post('/analyzeBook', analyzeBook);

module.exports = router;
