class ChatController {

    // HTML elements used by the chat controller
    #elem = {
        chatApp: null,
        chatButton: null,
        chatDisplay: null,
        chatInput: null,
        loginButton: null,
        loginForm: null,
        loginName: null,
        loginServer: null
    }

    // User's username
    #username = '';

    // WebSocket instance
    #ws = null;

    /**
     * Constructor for the ChatController class.
     * Loads credentials from local storage and initializes HTML elements when the DOM is loaded.
     */
    constructor() {
        const savedName = localStorage.getItem('loginName');
        const savedServer = localStorage.getItem('loginServer');

        document.addEventListener("DOMContentLoaded", () => {
            this.#connectHtmlElements(savedName, savedServer);
        });
    }

    /**
     * Connects HTML elements to corresponding properties and sets up event listeners.
     * @private
     * @param {string} name - The saved username from local storage.
     * @param {string} ip - The saved server IP from local storage.
     */
    #connectHtmlElements(name, ip) {
        this.#elem.chatApp = document.getElementById('chat-app');
        this.#elem.chatButton = document.getElementById('chat-button');
        this.#elem.chatDisplay = document.getElementById('chat-display');
        this.#elem.chatInput = document.getElementById('chat-input');
        this.#elem.loginButton = document.getElementById('login-button');
        this.#elem.loginForm = document.getElementById('login-form');
        this.#elem.loginName = document.getElementById('login-name');
        this.#elem.loginServer = document.getElementById('login-server');

        if (name && ip) {
            this.#username = name;
            this.#elem.loginName.value = name;
            this.#elem.loginServer.value = ip;

            const socket = new WebSocket(`ws://${ip}/ws?pageId=outsider`);

            socket.onmessage = this.#updateChats.bind(this);

            socket.onerror = (err) => {
                console.error('WebSocket Error:', err);
            };

            socket.onopen = () => {
                this.#ws = socket;
                this.getUpdates();
            };
        }

        this.#elem.loginButton.addEventListener('click', this.#saveCredentials.bind(this));
        this.#elem.chatButton.addEventListener('click', this.#sendMessage.bind(this));
    }

    /**
     * Sends a message to request updates from the WebSocket server.
     */
    getUpdates() {
        const msgObject = {
            message: null,
            route: 'chat',
            userId: this.simpleHash(window.location.href),
            userName: this.#username,
            type: 'string'
        };

        this.#ws.send(JSON.stringify(msgObject));
    }

    /**
     * Saves user credentials to local storage and establishes a WebSocket connection.
     * @private
     */
    #saveCredentials() {
        const name = this.#elem.loginName.value.trim();
        const server = this.#elem.loginServer.value.trim();

        if (!name || !server) {
            return;
        }

        const socket = new WebSocket(`ws://${server}/ws?pageId=outsider`);

        socket.onerror = (err) => {
            console.error('WebSocket Error:', err);
        };

        socket.onopen = () => {
            this.#elem.loginForm.style.display = 'none';
            this.#elem.chatApp.style.display = 'block';
            localStorage.setItem('loginName', name);
            localStorage.setItem('loginServer', server);
            this.#ws = socket;
            this.getUpdates();
        };
    }

    /**
     * Sends a chat message to the WebSocket server.
     * @private
     */
    #sendMessage() {
        const msg = this.#elem.chatInput.value.trim();
        if (msg.length < 1) {
            return;
        }

        const msgObject = {
            message: msg,
            route: 'chat',
            userId: this.simpleHash(window.location.href),
            userName: this.#username,
            type: 'string'
        };

        this.#ws.send(JSON.stringify(msgObject));
        this.#elem.chatInput.value = '';
    }

    /**
     * Calculates a simple hash for a given string.
     * @param {string} str - The string to be hashed.
     * @returns {string} - The hash value.
     */
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

    /**
     * Updates the chat display with new messages.
     * @private
     * @param {MessageEvent} rawMessage - The raw WebSocket message event.
     */
    #updateChats(rawMessage) {
        const history = JSON.parse(rawMessage.data).message;
        let newHtml = '';
        history.forEach((record) => {
            newHtml += `
                <div class="message-wrapper">
                    <div class="message">
                        ${record.message}
                    </div>
                    <!--
                    <div class="from">
                        ${record.from}
                    </div>
                    -->
                </div>
            `;
        });
        this.#elem.chatDisplay.innerHTML = newHtml;
    }

    /**
     * Gets the hash of the current URL to identify the user uniquely.
     * @returns {string} - The hash value.
     */
    whoAmI() {
        return this.simpleHash(window.location.href);
    }

}

// Create an instance of ChatController when the script is executed.
const chatController = new ChatController();
