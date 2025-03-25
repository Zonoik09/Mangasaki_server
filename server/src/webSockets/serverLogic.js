const fs = require('fs');
const webSockets = require('./utilsWebSockets.js').default;
'use strict';

class ServerLogic {
    constructor() {
        this.clients = new Map();
    }

    // Es connecta un client
    addClient(id) {
        this.clients.set(id, {
            id,
        });
        return this.clients.get(id);
    }

    // Es desconnecta un client
    removeClient(id) {
        this.clients.delete(id);
    }

    // Tractar un missatge d'un client
    handleMessage(id, msg) {
        try {
            let obj = JSON.parse(msg);
            if (!obj.type) return;
            console.log("Mensaje de tipo: " + obj.type + " recibido")
            switch (obj.type) {
                case "friendship_notification":
                    break;
                default:
                    break;
            }
        } catch (error) {}
    }
}

module.exports = ServerLogic;
