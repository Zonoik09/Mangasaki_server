const express = require('express');
const router = express.Router();
const {
    getUsersByCombination,
    getUserNotifications,
    declineFriendshipRequest,   
    deleteFriendship,
    getRecommendatiosFromFriends,
    deleteNotification,
} = require('../controllers/socialController.js');

/**
 * @swagger
 * /api/social/getUsersByCombination:
 *   post:
 *     summary: Busca usuarios por nickname excluyendo al usuario actual y sus amigos
 *     tags: [Social]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - combination
 *               - userId
 *             properties:
 *               combination:
 *                 type: string
 *                 example: "juan"
 *                 description: Parte del nickname a buscar
 *               userId:
 *                 type: integer
 *                 example: 5
 *                 description: ID del usuario que realiza la búsqueda (será excluido junto con sus amigos)
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
 *         description: Parámetros faltantes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/getUsersByCombination', getUsersByCombination);

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

/**
 * @swagger
 * /api/social/declineFriendRequest/{notificationId}:
 *   delete:
 *     summary: Rechaza una solicitud de amistad eliminando la notificación
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación de solicitud de amistad a eliminar
 *     responses:
 *       200:
 *         description: Solicitud de amistad rechazada correctamente
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
 *                   example: "Solicitud de amistad rechazada (eliminada)"
 *                 data:
 *                   type: null
 *       400:
 *         description: ID no proporcionado
 *       404:
 *         description: Solicitud de amistad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/declineFriendRequest/:notificationId', declineFriendshipRequest);

/**
 * @swagger
 * /api/social/deleteFriendship/{friendshipId}:
 *   delete:
 *     summary: Elimina una amistad existente
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la amistad a eliminar
 *     responses:
 *       200:
 *         description: Amistad eliminada correctamente
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
 *                   example: "Amistad eliminada correctamente"
 *                 data:
 *                   type: null
 *       400:
 *         description: ID de amistad no proporcionado
 *       404:
 *         description: Amistad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/deleteFriendship/:friendshipId', deleteFriendship);

/**
 * @swagger
 * /api/social/recommendations/{userId}:
 *   get:
 *     summary: Obtiene recomendaciones de mangas según lo que leen los amigos
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario que solicita las recomendaciones
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas correctamente
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
 *                   example: "Recomendaciones obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: ID de usuario no proporcionado
 *       500:
 *         description: Error interno al obtener recomendaciones
 */
router.get('/recommendations/:userId', getRecommendatiosFromFriends);

module.exports = router;
