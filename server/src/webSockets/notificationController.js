'use strict';

const Notification_Friend_Request = require('../models/Notification_Friend_Request.js');
const Notification_Friend = require('../models/Notification_Friend.js');
const Notification_Like = require('../models/Notification_Like.js');
const Notification_Recommendation = require('../models/Notification_Recommendation.js');

async function handleRequestNotification(sender_user_id, receiver_user_id,status,socket) {
    try {
        const notification = await Notification_Friend_Request.create({
            sender_user_id,
            receiver_user_id,
            status,
            created_at: new Date()
        });
        console.log("Notificación de solicitud de amistad creada:", notification);
    } catch (error) {
        console.error("Error creando notificación de solicitud de amistad:", error.message);
    }
}

async function handleFriendNotification(sender_user_id,receiver_user_id,socket) {
    try {
        const notification = await Notification_Friend.create({
            sender_user_id,
            receiver_user_id,
            created_at: new Date()
        });
        console.log("Notificación de amistad creada:", notification);
    } catch (error) {
        console.error("Error creando notificación de amistad:", error.message);
    }
}

async function handleLikeNotification(sender_user_id, receiver_user_id, gallery_id,socket) {
    try {
        const notification = await Notification_Like.create({
            sender_user_id,
            receiver_user_id,
            gallery_id,
            created_at: new Date()
        });
        console.log("Notificación de like creada:", notification);
    } catch (error) {
        console.error("Error creando notificación de like:", error.message);
    }
}

async function handleRecommendationNotification(sender_user_id,receiver_user_id,manga_name,socket) {
    try {
        const notification = await Notification_Recommendation.create({
            sender_user_id,
            receiver_user_id,
            manga_name,
            created_at: new Date()
        });
        console.log("Notificación de recomendación creada:", notification);
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
