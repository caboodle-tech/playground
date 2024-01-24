import Path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __dirname = Path.dirname(fileURLToPath(import.meta.url));

class DatabaseServer {

    #dbFile = Path.join(__dirname, '../data/sql-murder-mystery.sqlite');

    #webServer = null;

    constructor (webServer) {
        this.#webServer = webServer;
    }

    async close(db) {
        return new Promise(resolve => {
            db.close(resolve);
        });
    }

    async #open() {
        const db = new sqlite3.Database(this.#dbFile);
        return new Promise(resolve => {
            db.on('open', () => {
                resolve(db);
            });
        });
    }

    #respond(message, pageId) {
        this.#webServer.message(pageId, message);
    }

    async websocketListener(msgObj, pageId) {
        const db = await this.#open();
        this.#query(db, pageId, msgObj.message.query, msgObj.message.queryParams);
    }

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