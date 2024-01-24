import NodeSimpleServer from '@caboodle-tech/node-simple-server';
import { fileURLToPath } from 'url';
import Path from 'path';

import ChatWebsocket from './chat-websocket.js';
import DatabaseServer from '../database/db-websocket.js';

// Root directory of the application.
const APP_ROOT = Path.normalize(`${Path.dirname(fileURLToPath(import.meta.url))}/../../`);

// Directory containing the website files.
const websiteRoot = Path.join(APP_ROOT, 'www');

// Build server options object.
const serverOptions = {
    root: websiteRoot
};

// Get a new instance of NodeSimpleServer.
const Server = new NodeSimpleServer(serverOptions);

// Callback to handle file changes during development.
function watcherCallback(event, path, stats) {
    if (stats.ext === 'css') {
        Server.reloadAllStyles(); // Reload all stylesheets on CSS file change.
        return;
    }
    if (stats.ext === 'js') {
        Server.reloadAllPages(); // Reload all pages on JavaScript file change.
        return;
    }
    if (event === 'change') {
        Server.reloadSinglePage(path); // Reload a single page on any other file change.
    }
}

// Add WebSocket routes for chat and database.
const chatWebSocket = new ChatWebsocket();
Server.addWebsocketCallback('chat.*', chatWebSocket.websocketListener.bind(chatWebSocket));

const dbServer = new DatabaseServer(Server);
Server.addWebsocketCallback('database.*', dbServer.websocketListener.bind(dbServer));

// Watch the directory for changes during development.
const watcherOptions = {
    events: {
        all: watcherCallback, // Send all events to a single function.
    },
};

// Start the server.
Server.start();

// Watch the current directory for changes during development.
Server.watch(websiteRoot, watcherOptions);
