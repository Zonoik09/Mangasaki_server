const express = require('express');
const router = express.Router();
const {
    getUsersByCombination,
    getUserNotifications,
} = require('../controllers/socialController.js');

/**
 * @swagger
 * /api/social/getUsersByCombination/{combination}:
 *   get:
 *     summary: Obtiene usuarios basados en una combinación de su nickname
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: combination
 *         required: true
 *         schema:
 *           type: string
 *         description: Combinación del nickname para buscar usuarios
 *     responses:
 *       200:
 *         description: Usuarios encontrados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Usuarios encontrados"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nickname:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                         example: "default0.jpg"
 *       400:
 *         description: Combinación no proporcionada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/getUsersByCombination/:combination', getUsersByCombination);

module.exports = router;
