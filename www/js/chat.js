class ChatController {

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

    #username = '';

    #ws = null;

    constructor() {
        // Load credentials from local storage
        const savedName = localStorage.getItem('loginName');
        const savedServer = localStorage.getItem('loginServer');

        document.addEventListener("DOMContentLoaded", () => {
            this.#connectHtmlElements(savedName, savedServer);
        });
    }

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
            this.#elem.loginForm.style.display = 'none';
            this.#elem.chatApp.style.display = 'block';

            const socket = new WebSocket(`ws://${ip}/ws?pageId=outsider`);

            socket.onmessage = this.#updateChats.bind(this);
        
            socket.onerror = (err) => {
                console.error('WebSocket Error:', err);
            };

            socket.onopen = () => {
                this.#ws = socket;
            };
        }

        this.#elem.loginButton.addEventListener('click', this.#saveCredentials.bind(this));
        this.#elem.chatButton.addEventListener('click', this.#sendMessage.bind(this));
    }

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
            localStorage.setItem('loginName', name);
            localStorage.setItem('loginServer', server);
            this.#ws = socket;
            console.log(socket);
        };
    }

    #sendMessage() {
        const msg = this.#elem.chatInput.value.trim();
        if (msg.length < 1) {
            return;
        }

        const msgObject = {
            message: msg,
            route: 'chat',
            userId: this.simpleHash(this.#ws.url),
            userName: this.#username,
            type: 'string'
        };

        this.#ws.send(JSON.stringify(msgObject));
        this.#elem.chatInput.value = '';
    }

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

    #updateChats(rawMessage) {
        const history = JSON.parse(rawMessage.data).message;
        let newHtml = '';
        history.forEach((record) => {
            newHtml += `
                <div class="message-wrapper">
                    <div class="message">
                        ${record.message}
                    </div>
                    <div class="from">
                        ${record.from}
                    </div>
                </div>
            `;
        });
        this.#elem.chatDisplay.innerHTML = newHtml;
    }

    whoAmI() {
        return this.simpleHash(this.#ws.url);
    }

}

const chatController = new ChatController();