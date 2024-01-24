import NodeSimpleServer from '@caboodle-tech/node-simple-server'
import { fileURLToPath } from 'url';
import Path from 'path'

import ChatWebsocket from './chat-websocket.js';
import DatabaseServer from '../database/db-websocket.js';

// TODO
const APP_ROOT = Path.normalize(`${Path.dirname(fileURLToPath(import.meta.url))}/../../`);

// TODO
const websiteRoot = Path.join(APP_ROOT, 'www');

// Build a bare minimum server options object.
const serverOptions = {
    root: websiteRoot
};

// Get a new instance of NSS.
const Server = new NodeSimpleServer(serverOptions);

// A bare minimum callback to handle most development changes.
function watcherCallback(event, path, stats) {
    if (stats.ext === 'css') {
        Server.reloadAllStyles();
        return;
    }
    if (stats.ext === 'js') {
        /**
         * NOTE: This is a heavy request to use if your site loads resources from
         * other sites such as images, databases, or API calls. Consider a better
         * approach in these cases such as throttling.
         */
        Server.reloadAllPages();
        return;
    }
    if (event === 'change') {
        Server.reloadSinglePage(path);
    }
}

// Add any websocket routes here.
const chatWebSocket = new ChatWebsocket();
Server.addWebsocketCallback('chat.*', chatWebSocket.websocketListener.bind(chatWebSocket));

const dbServer = new DatabaseServer(Server);
Server.addWebsocketCallback('database.*', dbServer.websocketListener.bind(dbServer));


// A bare minimum watcher options object; use for development, omit for production.
const watcherOptions = {
    events: {
        all: watcherCallback, // Just send everything to a single function.
    },
};

// Start the server.
Server.start();

// Watch the current directory for changes; use for development, omit for production.
Server.watch(websiteRoot, watcherOptions);