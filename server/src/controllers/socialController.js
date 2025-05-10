const User = require('../models/User');

const Notification_Friend_Request = require('../models/Notification_Friend_Request.js');
const Notification_Friend = require('../models/Notification_Friend.js');
const Notification_Like = require('../models/Notification_Like.js');
const Notification_Recommendation = require('../models/Notification_Recommendation.js');

const { Op } = require('sequelize');

const { logger } = require('../config/logger');

const getUsersByCombination = async (req, res) => {
    try {
        const { combination } = req.params;

        if (!combination) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'La combinación es obligatoria',
                data: null,
            });
        }

        const users = await User.findAll({
            where: {
                nickname: {
                    [Op.like]: `%${combination}%`
                }
            },
            attributes: ['id', 'nickname']
        });

        // Reemplaza image_url por default0.jpg solo si es null
        const processedUsers = users.map(user => {
            return {
                id: user.id,
                nickname: user.nickname,
                image_url: user.image_url || 'default0.jpg'
            };
        });

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

module.exports = {
    getUsersByCombination,
    getUserNotifications,
};
