'use strict';

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

    handleMessage(socket, id, msg) {
        try {
            const obj = JSON.parse(msg);
            if (!obj.type) return;

            console.log(`Mensaje de tipo: ${obj.type} recibido de ${id}`);

            switch (obj.type) {
                case "friendship_notification":
                    // ejemplo: reenvía a otro cliente
                    const targetId = obj.targetId;
                    const messageToSend = JSON.stringify({
                        type: "friendship_notification",
                        from: id,
                        message: obj.message || "Tienes una nueva solicitud"
                    });

                    const targetClient = this.webSockets.getClientsIds().includes(targetId);
                    if (targetClient) {
                        this.webSockets.broadcast(messageToSend); // O enviar a uno si implementas `sendToClient`
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
    }

    removeClient(id) {
        this.clients.delete(id);
    }
}

module.exports = ServerLogic;
