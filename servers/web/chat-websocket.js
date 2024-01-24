class ChatWebsocket {

    #history = []; // Array to store chat history

    #sockets = {}; // Object to store user sockets

    /**
     * Notifies all connected sockets with the current chat history.
     * @private
     */
    #notifyEveryone() {
        Object.values(this.#sockets).forEach((socket) => {
            socket.send(this.#history);
        });
    }

    /**
     * Handles WebSocket messages and updates chat history.
     * @param {Object} msgObj - The WebSocket message object.
     * @param {string} pageId - The page ID associated with the message.
     * @param {WebSocket} socket - The WebSocket instance for the connection.
     */
    websocketListener(msgObj, pageId, socket) {
        this.#sockets[msgObj.userId] = socket; // Store user socket

        // Provide the history for this new connection but do not notify everyone else.
        if (!msgObj.message) {
            socket.send(this.#history);
            return;
        }
        
        this.#updateHistory({
            from: msgObj.userName,
            message: msgObj.message,
            userId: msgObj.userId
        });
        
        this.#notifyEveryone(); // Notify everyone about the updated history
    }

    /**
     * Adds a new item to the chat history and trims it if it exceeds a certain length.
     * @private
     * @param {Object} newItem - The new chat item to be added to the history.
     */
    #updateHistory(newItem) {
        // Add the new item to the history array
        this.#history.push(newItem);

        // Trim the history if it exceeds 50 items
        if (this.#history.length > 50) {
            this.#history = this.#history.slice(-50); // Keeps the last 50 items
        }
    }

}

export default ChatWebsocket;
