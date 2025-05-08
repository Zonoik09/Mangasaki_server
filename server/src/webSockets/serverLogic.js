'use strict';

const {
    handleRequestNotification,
    handleFriendNotification,
    handleLikeNotification,
    handleRecommendationNotification,
} = require('../controllers/notificationController.js');

class ServerLogic {
    constructor(webSockets) {
        this.clients = new Map();
        this.webSockets = webSockets;

        // Asigna funciones de evento
        this.webSockets.onConnection = this.handleConnection.bind(this);
        this.webSockets.onMessage = this.handleMessage.bind(this);
        this.webSockets.onClose = this.handleClose.bind(this);
    }

    handleConnection(socket, id) {
        console.log(`Conexión nueva: ${id}`);
        this.addClient(id);
    }

    handleClose(socket, id) {
        console.log(`Cliente desconectado: ${id}`);
        this.removeClient(id);
    }

    async handleMessage(socket, id, msg) {
        try {

            console.log(msg)
            const obj = JSON.parse(msg);
            if (!obj.type) return;

            console.log(`Mensaje de tipo: ${obj.type} recibido de ${id}`);

            let receiver_user_id, status, gallery_id, manga_name = obj.receiver_user_id;

            switch (obj.type) {
                case "joinedClientWithInfo":
                    this.handleJoinedClientWithInfo(id, obj);
                    break;

                case "friend_request_notification": 
                    console.log(JSON.stringify(clients));
                    sender_user_id = obj.sender_user_id;
                    receiver_user_id = obj.receiver_user_id;
                    handleRequestNotification(sender_user_id,receiver_user_id,status,socket);
                    status = "PENDING"
                    break;

                case "friend_notification":
                    console.log(JSON.stringify(clients));
                    sender_user_id = obj.sender_user_id;
                    receiver_user_id = obj.receiver_user_id;
                    handleFriendNotification(sender_user_id,receiver_user_id,socket);
                    break;
                
                case "like_notification":
                    console.log(JSON.stringify(clients));
                    sender_user_id = obj.sender_user_id;
                    receiver_user_id = obj.receiver_user_id;
                    gallery_id = obj.gallery_id;
                    handleLikeNotification(sender_user_id,receiver_user_id,gallery_id,socket);
                    break;

                case "recommendation_notification":
                    console.log(JSON.stringify(clients));
                    sender_user_id = obj.sender_user_id;
                    receiver_user_id = obj.receiver_user_id;
                    manga_name = obj.manga_name;
                    handleRecommendationNotification(sender_user_id,receiver_user_id,manga_name,socket);
                    break;

                default:
                    console.log(`Tipo de mensaje no reconocido: ${obj.type}`);
                    break;
            }
        } catch (err) {
            console.error("Error al procesar mensaje:", err.message);
        }
    }

    addClient(id) {
        this.clients.set(id, { id });
    }

    removeClient(id) {
        this.clients.delete(id);
    }

    handleJoinedClientWithInfo(id, obj) {
        console.log(`Cliente ${id} se unió con la siguiente información:`, obj);

        this.clients.set(id, { ...this.clients.get(id), username: obj.username });

        const response = JSON.stringify({
            type: "joinedClientWithInfoResponse",
            message: "Información del cliente recibida correctamente"
        });

        this.webSockets.sendToClient(id, response);
    }
}

module.exports = ServerLogic;

