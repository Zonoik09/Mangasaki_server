const User = require('../models/User');

const Notification_Friend_Request = require('../models/Notification_Friend_Request.js');
const Notification_Friend = require('../models/Notification_Friend.js');
const Notification_Like = require('../models/Notification_Like.js');
const Notification_Recommendation = require('../models/Notification_Recommendation.js');

const Friendship = require('../models/Friendship.js');
const User_Manga = require('../models/User_Manga.js')

const { Op } = require('sequelize');

const { logger } = require('../config/logger');

const getUsersByCombination = async (req, res) => {
    try {
        const { combination, userId } = req.body;

        if (!combination || !userId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'La combinación y el userId son obligatorios',
                data: null,
            });
        }

        // Obtener el usuario actual (para conocer su nickname)
        const currentUser = await User.findByPk(userId);
        if (!currentUser) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        // Obtener IDs de usuarios con los que ya hay amistad
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id_1: userId },
                    { user_id_2: userId }
                ]
            }
        });

        const friendIds = friendships.flatMap(f => 
            f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
        );

        // Buscar usuarios que coincidan con el filtro y no estén en amistades ni sean el mismo usuario
        const users = await User.findAll({
            where: {
                [Op.and]: [
                    {
                        nickname: {
                            [Op.like]: `%${combination}%`
                        }
                    },
                    {
                        nickname: {
                            [Op.ne]: currentUser.nickname
                        }
                    },
                    {
                        id: {
                            [Op.notIn]: [userId, ...friendIds]
                        }
                    }
                ]
            },
            attributes: ['id', 'nickname', 'image_url']
        });

        const processedUsers = users.map(user => ({
            id: user.id,
            nickname: user.nickname,
            image_url: user.image_url || 'default0.jpg'
        }));

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Usuarios encontrados',
            data: processedUsers,
        });
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al buscar usuarios',
            data: null,
        });
    }
};

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'ID de usuario no proporcionado',
                data: null,
            });
        }

        const [
            friendRequests,
            friends,
            likes,
            recommendations
        ] = await Promise.all([
            Notification_Friend_Request.findAll({ where: { receiver_user_id: userId }, raw: true }),
            Notification_Friend.findAll({ where: { receiver_user_id: userId }, raw: true }),
            Notification_Like.findAll({ where: { receiver_user_id: userId }, raw: true }),
            Notification_Recommendation.findAll({ where: { receiver_user_id: userId }, raw: true }),
        ]);

        const notifications = [
            ...friendRequests.map(n => ({ ...n, type: 'FRIEND_REQUEST' })),
            ...friends.map(n => ({ ...n, type: 'FRIEND' })),
            ...likes.map(n => ({ ...n, type: 'LIKE' })),
            ...recommendations.map(n => ({ ...n, type: 'RECOMMENDATION' })),
        ];

        // Orden descendente por fecha de creación
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Notificaciones obtenidas correctamente',
            data: notifications,
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al obtener notificaciones',
            data: null,
        });
    }
};

const declineFriendshipRequest = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!notificationId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'ID de notificación no proporcionado',
                data: null,
            });
        }

        const deleted = await Notification_Friend_Request.destroy({
            where: { id: notificationId }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Solicitud de amistad no encontrada',
                data: null,
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Solicitud de amistad rechazada (eliminada)',
            data: null,
        });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al rechazar solicitud',
            data: null,
        });
    }
};

const deleteFriendship = async (req, res) => {
    try {
        const { friendshipId } = req.params;

        if (!friendshipId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'ID de amistad no proporcionado',
                data: null,
            });
        }

        const deleted = await Friendship.destroy({
            where: { id: friendshipId }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Amistad no encontrada',
                data: null,
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Amistad eliminada correctamente',
            data: null,
        });
    } catch (error) {
        console.error('Error al eliminar amistad:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al eliminar amistad',
            data: null,
        });
    }
};

const getRecommendatiosFromFriends = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'ID de usuario no proporcionado',
                data: null,
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado.',
                data: null,
            });
        }

        // Obtener IDs de amigos
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id_1: userId },
                    { user_id_2: userId },
                ],
            },
        });

        const friendIds = friendships.map(f =>
            f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
        );

        if (friendIds.length === 0) {
            friendIds.push(-1); // para evitar errores si no tiene amigos
        }

        // Obtener mangas de amigos con estado READING o COMPLETED
        const userMangas = await User_Manga.findAll({
            where: {
                user_id: { [Op.in]: friendIds },
                status: { [Op.in]: ['READING', 'COMPLETED'] },
            },
            attributes: ['manga_id'],
        });

        // Extraer IDs únicos
        const mangaIdsSet = new Set(userMangas.map(m => m.manga_id));
        const mangaIds = Array.from(mangaIdsSet);

        // Si hay menos de 9, rellenar con IDs random (sin duplicar)
        while (mangaIds.length < 9) {
            const randomId = Math.floor(Math.random() * 500) + 1;
            if (!mangaIds.includes(randomId)) {
                mangaIds.push(randomId);
            }
        }

        // Mezclar y tomar solo 9
        const shuffled = mangaIds.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 9);

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Recomendaciones obtenidas correctamente',
            data: selected,
        });

    } catch (error) {
        console.error('Error al obtener recomendaciones:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al obtener recomendaciones',
            data: null,
        });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { type, notificationId } = req.body;

        if (!type || !notificationId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El type y el notificationId son obligatorios',
                data: null,
            });
        }

        let deleted = 0;

        switch (type) {
            case "FRIEND_REQUEST": // probablemente querías escribir "FRIEND_REQUEST"
                deleted = await Notification_Friend_Request.destroy({ where: { id: notificationId } });
                break;

            case "FRIEND":
                deleted = await Notification_Friend.destroy({ where: { id: notificationId } });
                break;

            case "LIKE":
                deleted = await Notification_Like.destroy({ where: { id: notificationId } });
                break;

            case "RECOMMENDATION":
                deleted = await Notification_Recommendation.destroy({ where: { id: notificationId } });
                break;

            default:
                return res.status(400).json({
                    status: 'ERROR',
                    message: `Tipo de notificación inválido: ${type}`,
                    data: null,
                });
        }

        if (deleted === 0) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Registro no encontrado',
                data: null,
            });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            message: `${type} eliminado correctamente`,
            data: null,
        });

    } catch (error) {
        console.error('Error al eliminar registro:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al eliminar registro',
            data: null,
        });
    }
};

/**
 * @swagger
 * /api/social/deleteNotification:
 *   delete:
 *     summary: Elimina una notificación según su tipo e ID
 *     tags: [Social]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - notificationId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [FRIEND_REQUEST, FRIEND, LIKE, RECOMMENDATION]
 *                 example: "FRIEND"
 *                 description: Tipo de notificación a eliminar
 *               notificationId:
 *                 type: integer
 *                 example: 12
 *                 description: ID de la notificación que se desea eliminar
 *     responses:
 *       200:
 *         description: Notificación eliminada correctamente
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
 *                   example: "FRIEND eliminado correctamente"
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Petición inválida (falta un campo o tipo incorrecto)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El type y el notificationId son obligatorios"
 *       404:
 *         description: Notificación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Registro no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/deleteNotification', deleteNotification);

module.exports = {
    getUsersByCombination,
    getUserNotifications,
    declineFriendshipRequest,   
    deleteFriendship,
    getRecommendatiosFromFriends,
    deleteNotification
};
