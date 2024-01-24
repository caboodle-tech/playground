import Path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// You can remove this but it was left on purpose to help you.
sqlite3.verbose();

const __dirname = Path.dirname(fileURLToPath(import.meta.url));

/**
 * DatabaseServer class for handling SQLite database operations.
 */
class DatabaseServer {

    #dbFile = Path.join(__dirname, '../data/sql-murder-mystery.sqlite');

    #webServer = null;

    /**
     * Constructor for the DatabaseServer class.
     * @param {WebServer} webServer - An instance of the WebServer class.
     */
    constructor (webServer) {
        this.#webServer = webServer;
    }

    /**
     * Closes the database connection.
     * @param {sqlite3.Database} db - The SQLite database instance.
     * @returns {Promise<void>} - A promise that resolves when the database is closed.
     */
    async close(db) {
        return new Promise(resolve => {
            db.close(resolve);
        });
    }

    /**
     * Opens the SQLite database connection.
     * @private
     * @returns {Promise<sqlite3.Database>} - A promise that resolves with the opened database instance.
     */
    async #open() {
        const db = new sqlite3.Database(this.#dbFile);
        return new Promise(resolve => {
            db.on('open', () => {
                resolve(db);
            });
        });
    }

    /**
     * Sends a response message to the web server.
     * @private
     * @param {string} message - The message to be sent.
     * @param {string} pageId - The page ID to identify the destination.
     */
    #respond(message, pageId) {
        this.#webServer.message(pageId, message);
    }

    /**
     * Listens for WebSocket messages and performs database queries.
     * @param {Object} msgObj - The WebSocket message object.
     * @param {string} pageId - The page ID associated with the message.
     */
    async websocketListener(msgObj, pageId) {
        const db = await this.#open();
        this.#query(db, pageId, msgObj.message.query, msgObj.message.queryParams);
    }

    /**
     * Executes a database query and responds with the result.
     * @private
     * @param {sqlite3.Database} db - The SQLite database instance.
     * @param {string} pageId - The page ID to identify the destination for the response.
     * @param {string} query - The SQL query to be executed.
     * @param {Array} queryParams - The parameters for the query (optional).
     */
    async #query(db, pageId, query, queryParams = []) {
        let result = [];
        
        try {
            result = await new Promise((resolve, reject) => {
                db.all(query, queryParams, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    } 
                });
            });
        } catch (error) {
            result = error.toString().replace('Error: ', '');
        }

        this.#respond(result, pageId);
    }
    
}

export default DatabaseServer;