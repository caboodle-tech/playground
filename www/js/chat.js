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

    #sendMessage() {
        const msg = this.#elem.chatInput.value.trim();
        if (msg.length < 1) {
            return;
        }

        const msgObject = {
            message: msg,
            route: 'chat',
            type: 'string'
        };

        this.#ws.send(JSON.stringify(msgObject));
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

    #updateChats(history) {
        console.log(history);
    }

}

const chatController = new ChatController();