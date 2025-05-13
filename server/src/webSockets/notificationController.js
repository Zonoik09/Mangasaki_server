'use strict';

const User = require('../models/User.js');
const Gallery = require('../models/Gallery.js');
const Friendship = require('../models/Friendship.js')
const { Op } = require('sequelize');

const Notification_Friend_Request = require('../models/Notification_Friend_Request.js');
const Notification_Friend = require('../models/Notification_Friend.js');
const Notification_Like = require('../models/Notification_Like.js');
const Notification_Recommendation = require('../models/Notification_Recommendation.js');

async function handleRequestNotification(sender_user_id, receiver_username, status, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findOne({ where: { nickname: receiver_username } });

        if (!sender || !receiver) {
            console.warn("Usuario emisor o receptor no encontrado.");
            return;
        }

        const receiver_user_id = receiver.id;

        const existingRequest = await Notification_Friend_Request.findOne({
            where: {
                sender_user_id,
                receiver_user_id,
            }
        });

        if (existingRequest) {
            console.log("Ya existe una notificación de solicitud de amistad entre estos usuarios.");

            if (socket) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                status: 'ERROR',
                message: 'Friend request notification already exists.'
                }));
            }
            
            return;
        }

        const friendshipExists = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id_1: sender_user_id, user_id_2: receiver_user_id },
                    { user_id_1: receiver_user_id, user_id_2: sender_user_id }
                ]
            }
        });

        if (friendshipExists) {
            console.log("Los usuarios ya son amigos.");

            if (socket) {
                socket.send(JSON.stringify({
                    type: 'notificationSent',
                    status: 'ERROR',
                    message: 'Users are already friends.'
                }));
            }

            return;
        }

        const message = `${sender.nickname} has sent you a friend request.`;

        const notification = await Notification_Friend_Request.create({
            sender_user_id,
            receiver_user_id,
            status,
            message,
            created_at: new Date()
        });

        console.log("Notificación de solicitud de amistad creada:", notification);

        // Enviar notificación al receptor
        if (receiverSocket) {
            receiverSocket.send(JSON.stringify({
                type: 'notification',
                subtype: 'friend_request',
                data: {
                    id: notification.id,
                    sender_user_id,
                    sender_nickname: sender.nickname,
                    receiver_user_id,
                    status,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor
        if (socket) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                status: 'OK',
                message: 'Friend request notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de solicitud de amistad:", error.message);
    }
}

async function handleFriendNotification(sender_user_id, receiver_username, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findOne({ where: { nickname: receiver_username } });

        if (!sender || !receiver) {
            console.warn("Usuario emisor o receptor no encontrado.");
            return;
        }

        const receiver_user_id = receiver.id;

        const message = `${sender.nickname} has accepted your friend request.`;

        const notification = await Notification_Friend.create({
            sender_user_id,
            receiver_user_id,
            message,
            created_at: new Date()
        });

        console.log("Notificación de amistad creada:", notification);

        await Notification_Friend_Request.destroy({
            where: {
                [Op.or]: [
                    { sender_user_id, receiver_user_id },
                    { sender_user_id: receiver_user_id, receiver_user_id: sender_user_id }
                ]
            }
        });

        // Crear la amistad entre los usuarios (Friendship)
        const friendship = await Friendship.create({
            user_id_1: sender_user_id,
            user_id_2: receiver_user_id
        });

        console.log("Amistad creada entre los usuarios:", friendship);

        // Enviar notificación al receptor (quien recibió la solicitud)
        if (receiverSocket && receiverSocket.readyState === 1) {
            receiverSocket.send(JSON.stringify({
                type: 'notification',
                subtype: 'friend',
                data: {
                    id: notification.id,
                    sender_user_id,
                    sender_nickname: sender.nickname,
                    receiver_user_id,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor (quien la acepta)
        if (socket) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                status: "OK",
                message: 'Friend notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de amistad:", error.message);
    }
}

async function handleLikeNotification(sender_user_id, receiver_username, gallery_id, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findOne({ where: { nickname: receiver_username } });
        const gallery = await Gallery.findByPk(gallery_id);

        if (!sender || !receiver || !gallery) {
            console.warn("Usuario emisor, receptor o galería no encontrado.");
            return;
        }

        const receiver_user_id = receiver.id;

        const existing = await Notification_Like.findOne({
            where: {
                sender_user_id,
                receiver_user_id,
                gallery_id
            }
        });

        if (existing) {
            console.log("Ya existe una notificación de like para esta combinación.");

            if (socket) {
                socket.send(JSON.stringify({
                    type: 'notificationSent',
                    status: 'ERROR',
                    message: 'You already liked this story.'
                }));
            }

            return;
        }

        // Sumar 1 al contador de likes
        gallery.likes += 1;
        await gallery.save();

        const message = `${sender.nickname} liked your story.`;

        const notification = await Notification_Like.create({
            sender_user_id,
            receiver_user_id,
            gallery_id,
            message,
            created_at: new Date()
        });

        console.log("Notificación de like creada:", notification);

        // Notificación al receptor
        if (receiverSocket) {
            receiverSocket.send(JSON.stringify({
                type: 'notification',
                subtype: 'like',
                data: {
                    id: notification.id,
                    sender_user_id,
                    sender_nickname: sender.nickname,
                    receiver_user_id,
                    gallery_id,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor
        if (socket) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                status: 'OK',
                message: 'Like notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de like:", error.message);
    }
}

async function handleRecommendationNotification(sender_user_id, receiver_username, manga_id, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findOne({ where: { nickname: receiver_username } });

        if (!sender || !receiver) {
            console.warn("Usuario emisor o receptor no encontrado.");
            return;
        }

        const receiver_user_id = receiver.id;

        const message = `${sender.nickname} recommended the book "${manga_id}" to you.`;

        const notification = await Notification_Recommendation.create({
            sender_user_id,
            receiver_user_id,
            manga_id,
            message,
            created_at: new Date()
        });

        console.log("Notificación de recomendación creada:", notification);

        // Notificación al receptor
        if (receiverSocket && receiverSocket.readyState === 1) {
            receiverSocket.send(JSON.stringify({
                type: 'notification',
                subtype: 'recommendation',
                data: {
                    id: notification.id,
                    sender_user_id,
                    sender_nickname: sender.nickname,
                    receiver_user_id,
                    manga_id,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                status: 'OK',
                message: 'Recommendation notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de recomendación:", error.message);
    }
}

async function handleGetFriendsOnlineOffline(clients, sender_username, socket) {
    try {
        const user = await User.findOne({ where: { nickname: sender_username } });

        if (!user) {
            console.warn("El usuario que hizo la solicitud no existe");
            return;
        }

        const user_id = user.id;

        // Obtener amistades del usuario
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id_1: user_id },
                    { user_id_2: user_id }
                ]
            }
        });

        // Sacar IDs de los amigos
        const friendIds = friendships.map(friendship =>
            friendship.user_id_1 === user_id ? friendship.user_id_2 : friendship.user_id_1
        );

        // Buscar todos los amigos por ID
        const friends = await User.findAll({
            where: { id: friendIds },
            attributes: ['id', 'nickname']
        });

        // Separar amigos online y offline
        const onlineFriends = [];
        const offlineFriends = [];

        for (const friend of friends) {
            const isOnline = [...clients.values()].some(client => client.username === friend.nickname);

            // Verificar si el amigo está en línea o fuera de línea
            if (isOnline) {
                console.log(`Amigo en línea: ${friend.nickname}`);
                onlineFriends.push(friend);
            } else {
                console.log(`Amigo fuera de línea: ${friend.nickname}`);
                offlineFriends.push(friend);
            }
        }

        // Enviar al socket solo si está conectado
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                type: 'amigosOnlineOfflineCompartidos',
                status: 'OK',
                message: 'amigosOnlineOfflineCompartidos correctamente',
                data: {
                    online: onlineFriends,
                    offline: offlineFriends
                }
            }));
        }

    } catch (error) {
        console.error("Error al obtener amigos online/offline:", error.message);
    }
}


module.exports = {
    handleRequestNotification,
    handleFriendNotification,
    handleLikeNotification,
    handleRecommendationNotification,
    handleGetFriendsOnlineOffline
};
