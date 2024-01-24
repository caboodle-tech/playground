class ChatWebsocket {

    #history = [];

    #updateHistory(newItem) {
        // Add the new item to the history array
        this.#history.push(newItem);

        // Trim the history if it exceeds 50 items
        if (this.#history.length > 50) {
            this.#history = this.#history.slice(-50); // Keeps the last 50 items
        }
    }

    websocketListener(msgObj, pageId, socket) {
        this.#updateHistory({
            from: msgObj.userName,
            message: msgObj.message,
            userId: msgObj.userId
        });
        socket.send(this.#history);
    }

}

export default ChatWebsocket;