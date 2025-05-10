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

/**
 * @swagger
 * /api/social/getUserNotifications/{userId}:
 *   get:
 *     summary: Obtiene todas las notificaciones para un usuario dado por su ID
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario receptor de notificaciones
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas exitosamente
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
 *                   example: "Notificaciones obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       sender_user_id:
 *                         type: integer
 *                       receiver_user_id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       type:
 *                         type: string
 *                         enum: [FRIEND_REQUEST, FRIEND, LIKE, RECOMMENDATION]
 *       400:
 *         description: ID de usuario no proporcionado
 *       500:
 *         description: Error interno al obtener notificaciones
 */
router.get('/getUserNotifications/:userId', getUserNotifications);

module.exports = router;
