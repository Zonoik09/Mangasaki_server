'use strict';

const User = require('../models/User.js');
const Gallery = require('../models/Gallery.js');
const Friendship = require('../models/Friendship.js')

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

        const existing = await Notification_Friend_Request.findOne({
            where: {
                sender_user_id,
                receiver_user_id,
            }
        });

        if (existing) {
            console.log("Ya existe una notificación de solicitud de amistad entre estos usuarios.");
            return;
        }

        const message = `${sender.nickname} te ha enviado una solicitud de amistad.`;

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
                    receiver_user_id,
                    status,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                message: 'Friend request notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de solicitud de amistad:", error.message);
    }
}

async function handleFriendNotification(sender_user_id, receiver_user_id, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findByPk(receiver_user_id);

        if (!sender || !receiver) {
            console.warn("Usuario emisor o receptor no encontrado.");
            return;
        }

        const existing = await Notification_Friend.findOne({
            where: { sender_user_id, receiver_user_id }
        });

        if (existing) {
            console.log("Ya existe una notificación de amistad entre estos usuarios.");
            return;
        }

        const message = `${sender.username} ha aceptado tu solicitud de amistad.`;

        const notification = await Notification_Friend.create({
            sender_user_id,
            receiver_user_id,
            message,
            created_at: new Date()
        });

        console.log("Notificación de amistad creada:", notification);

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
                message: 'Friend notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de amistad:", error.message);
    }
}

async function handleLikeNotification(sender_user_id, receiver_user_id, gallery_id, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findByPk(receiver_user_id);
        const gallery = await Gallery.findByPk(gallery_id);

        if (!sender || !receiver || !gallery) {
            console.warn("Usuario emisor, receptor o galería no encontrado.");
            return;
        }

        const existing = await Notification_Like.findOne({
            where: {
                sender_user_id,
                receiver_user_id,
                gallery_id
            }
        });

        if (existing) {
            console.log("Ya existe una notificación de like para esta combinación.");
            return;
        }

        // Sumar 1 al contador de likes
        gallery.likes += 1;
        await gallery.save();

        const message = `${sender.username} te ha dado like a tu historia.`;

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
                message: 'Like notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de like:", error.message);
    }
}

async function handleRecommendationNotification(sender_user_id, receiver_user_id, manga_name, socket, receiverSocket) {
    try {
        const sender = await User.findByPk(sender_user_id);
        const receiver = await User.findByPk(receiver_user_id);

        if (!sender || !receiver) {
            console.warn("Usuario emisor o receptor no encontrado.");
            return;
        }

        const message = `${sender.username} te ha recomendado el libro "${manga_name}".`;

        const notification = await Notification_Recommendation.create({
            sender_user_id,
            receiver_user_id,
            manga_name,
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
                    receiver_user_id,
                    manga_name,
                    message,
                    created_at: notification.created_at
                }
            }));
        }

        // Confirmación al emisor
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({
                type: 'notificationSent',
                message: 'Recommendation notification sent successfully.'
            }));
        }

    } catch (error) {
        console.error("Error creando notificación de recomendación:", error.message);
    }
}

module.exports = {
    handleRequestNotification,
    handleFriendNotification,
    handleLikeNotification,
    handleRecommendationNotification,
};
