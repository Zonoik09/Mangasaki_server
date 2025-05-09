'use strict';

const {
    handleRequestNotification,
    handleFriendNotification,
    handleLikeNotification,
    handleRecommendationNotification,
} = require('../webSockets/notificationController');

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

            let sender_user_id, receiver_username, status, gallery_id, manga_name, receiverClient, receiverSocket, receiver_user_id;

            switch (obj.type) {
                case "joinedClientWithInfo":
                    this.handleJoinedClientWithInfo(id, obj, socket);
                    break;

                case "friend_request_notification": 
                    console.log(this.clients);
                    print(msg)
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    receiverClient = [...this.clients.values()].find(client => client.username === receiver_username);
                    if (!receiverClient || !receiverClient.socket) {
                        console.log(`Socket no encontrado para usuario receptor: ${receiver_username}`);
                        return;
                    }
                
                    receiverSocket = receiverClient.socket;
                    receiver_user_id = receiverClient.id;
                    handleRequestNotification(sender_user_id,receiver_user_id,status,socket,receiverSocket);
                    status = "PENDING"
                    break;

                case "friend_notification":
                    console.log(this.clients);
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    receiverClient = [...this.clients.values()].find(client => client.username === receiver_username);
                    if (!receiverClient || !receiverClient.socket) {
                        console.log(`Socket no encontrado para usuario receptor: ${receiver_username}`);
                        return;
                    }
                
                    receiverSocket = receiverClient.socket;
                    receiver_user_id = receiverClient.id;
                    handleFriendNotification(sender_user_id,receiver_user_id,socket,receiverSocket);
                    break;
                
                case "like_notification":
                    console.log(this.clients);
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    gallery_id = obj.gallery_id;
                    receiverClient = [...this.clients.values()].find(client => client.username === receiver_username);
                    if (!receiverClient || !receiverClient.socket) {
                        console.log(`Socket no encontrado para usuario receptor: ${receiver_username}`);
                        return;
                    }
                
                    receiverSocket = receiverClient.socket;
                    receiver_user_id = receiverClient.id;
                    handleLikeNotification(sender_user_id,receiver_user_id,gallery_id,socket,receiverSocket);
                    break;

                case "recommendation_notification":
                    console.log(this.clients);
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    manga_name = obj.manga_name;
                    receiverClient = [...this.clients.values()].find(client => client.username === receiver_username);
                    if (!receiverClient || !receiverClient.socket) {
                        console.log(`Socket no encontrado para usuario receptor: ${receiver_username}`);
                        return;
                    }
                
                    receiverSocket = receiverClient.socket;
                    receiver_user_id = receiverClient.id;
                    handleRecommendationNotification(sender_user_id,receiver_user_id,manga_name,socket,receiverSocket);
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
        console.log(this.clients)
    }

    removeClient(id) {
        this.clients.delete(id);
    }

    handleJoinedClientWithInfo(id, obj, socket) {
        console.log(`Cliente ${id} se unió con la siguiente información:`, obj);

        this.clients.set(id, { ...this.clients.get(id), username: obj.username, socket: socket});

        const response = JSON.stringify({
            type: "joinedClientWithInfoResponse",
            message: "Información del cliente recibida correctamente"
        });

        this.webSockets.sendToClient(id, response);
    }
}

module.exports = ServerLogic;

