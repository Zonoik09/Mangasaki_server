import { Server, OPEN } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class Obj {
    init(httpServer, port) {
        this.onConnection = (socket, id) => { };
        this.onMessage = (socket, id, obj) => { };
        this.onClose = (socket, id) => { };

        this.ws = new Server({ server: httpServer });
        this.socketsClients = new Map();
        console.log(`Listening for WebSocket queries on ${port}`);

        this.ws.on('connection', (ws) => { this.newConnection(ws); });
    }

    end() {
        this.ws.close();
    }

    newConnection(con) {
        console.log("Client connected");

        const id = "C" + uuidv4().substring(0, 5).toUpperCase();
        const metadata = { id };
        this.socketsClients.set(con, metadata);

        con.send(JSON.stringify({
            type: "welcome",
            id: id,
            message: "Welcome to the server"
        }));

        this.broadcast(JSON.stringify({
            type: "newClient",
            id: id
        }));

        if (this.onConnection && typeof this.onConnection === "function") {
            this.onConnection(con, id);
        }

        con.on("close", () => {
            this.closeConnection(con);
            this.socketsClients.delete(con);
        });

        con.on('message', (bufferedMessage) => { 
            this.newMessage(con, id, bufferedMessage);
        });
    }

    closeConnection(con) {
        if (this.onClose && typeof this.onClose === "function") {
            var id = this.socketsClients.get(con).id;
            this.onClose(con, id);
        }

        this.broadcast(JSON.stringify({
            type: "clientDisconnected",
            id: this.socketsClients.get(con)?.id || "unknown"
        }));
    }

    newMessage(ws, id, bufferedMessage) {
        var messageAsString = bufferedMessage.toString();
        if (this.onMessage && typeof this.onMessage === "function") {
            this.onMessage(ws, id, messageAsString);
        }
    }

    broadcast(message) {
        for (let client of this.socketsClients.keys()) {
            if (client.readyState === OPEN) {
                client.send(message);
            }
        }
    }

    getClientData(id) {
        for (let [client, metadata] of this.socketsClients.entries()) {
            if (metadata.id === id) {
                return metadata;
            }
        }
        return null;
    }

    getClientsIds() {
        let clients = [];
        this.socketsClients.forEach((value) => {
            clients.push(value.id);
        });
        return clients;
    }

    getClientsData() {
        let clients = [];
        for (let [, metadata] of this.socketsClients.entries()) {
            clients.push(metadata);
        }
        return clients;
    }
}

export default Obj;
