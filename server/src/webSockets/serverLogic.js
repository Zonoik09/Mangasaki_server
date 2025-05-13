'use strict';

const {
    handleRequestNotification,
    handleFriendNotification,
    handleLikeNotification,
    handleRecommendationNotification,
    handleGetFriendsOnlineOffline,
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
            const obj = JSON.parse(msg);

            if (!obj.type) return;

            if (obj.type !== "getFriendsOnlineOffline") {
                console.log(msg);
                console.log(`Mensaje de tipo: ${obj.type} recibido de ${id}`);
            }

            let sender_user_id, receiver_username, status, gallery_id, manga_id, receiverSocket, sender_username;

            const findReceiver = (username) => {
                const client = [...this.clients.values()].find(c => c.username === username);
                if (!client || !client.socket) {
                    console.log(`Socket no encontrado para usuario receptor, puede estar offline...: ${username}`);
                    return { socket: null, username: username };
                }
                return { socket: client.socket, username: client.username };
            };

            switch (obj.type) {
                case "joinedClientWithInfo":
                    this.handleJoinedClientWithInfo(id, obj, socket);
                    break;

                case "friend_request_notification": 
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    ({ socket: receiverSocket, username: receiver_username } = findReceiver(receiver_username));
                    status = "PENDING";
                    handleRequestNotification(sender_user_id, receiver_username, status, socket, receiverSocket);
                    break;

                case "friend_notification":
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    ({ socket: receiverSocket, username: receiver_username } = findReceiver(receiver_username));
                    handleFriendNotification(sender_user_id, receiver_username, socket, receiverSocket);
                    break;

                case "like_notification":
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    gallery_id = obj.gallery_id;
                    ({ socket: receiverSocket, username: receiver_username } = findReceiver(receiver_username));
                    handleLikeNotification(sender_user_id, receiver_username, gallery_id, socket, receiverSocket);
                    break;

                case "recommendation_notification":
                    sender_user_id = obj.sender_user_id;
                    receiver_username = obj.receiver_username;
                    manga_id = obj.manga_id;
                    ({ socket: receiverSocket, username: receiver_username } = findReceiver(receiver_username));
                    handleRecommendationNotification(sender_user_id, receiver_username, manga_id, socket, receiverSocket);
                    break;

                case "getFriendsOnlineOffline":
                    sender_username = obj.username;
                    handleGetFriendsOnlineOffline(this.clients, sender_username, socket);
                    break;
                
                case "disconnectRequest":
                    sender_username = obj.username;

                    // Encontrar al cliente correspondiente por username
                    const clientEntry = [...this.clients.entries()].find(([_, c]) => c.username === sender_username);

                    if (clientEntry) {
                        const [clientId, client] = clientEntry;

                        console.log(`Solicitud de desconexión recibida para: ${sender_username} (ID: ${clientId})`);

                        // Eliminar del mapa de clientes
                        this.clients.delete(clientId);

                        // Cerrar socket si está abierto
                        if (client.socket && client.socket.close) {
                            client.socket.close();
                        }

                        // (Opcional) Responder confirmación de desconexión
                        const response = JSON.stringify({
                            type: "disconnectResponse",
                            message: "Desconexión realizada correctamente",
                        });

                        socket.send(response);
                    } else {
                        console.log(`No se encontró cliente con username: ${sender_username}`);
                    }
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

