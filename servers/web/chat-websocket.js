class ChatWebsocket {

    #history = [];

    // https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash; // Convert to 32bit integer
        }
        return new Uint32Array([hash])[0].toString(36);
    }

    websocketListener(msgObj, pageId, socket) {
        const message = msgObj.message
        const from = socket.url
        this.#history.push({ message, from });
        socket.send(JSON.stringify(this.#history));
    }

}

export default ChatWebsocket;