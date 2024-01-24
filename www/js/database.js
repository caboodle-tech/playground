class DatabaseConnector {

    // HTML elements used by the database connector
    elem = {
        clear: null,
        history: null,
        results: null,
        run: null,
        textarea: null
    }

    /**
     * Constructor for the DatabaseConnector class.
     * Registers event listeners and initializes HTML elements when the DOM is loaded.
     */
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            NSS_WS.registerCallback(this.#response.bind(this));
            this.#connectHtmlElements();
        });
    }

    /**
     * Adds a SQL query to the history section with double-click functionality.
     * @private
     * @param {string} sql - The SQL query to be added to the history.
     */
    #addToHistory(sql) {
        const record = document.createElement('div');
        record.classList.add('sql-history-record');
        record.innerHTML = sql;

        record.addEventListener("dblclick", () => {
            this.elem.textarea.value = sql;
            this.elem.run.click();
        });

        
    }

    /**
     * Clears the SQL textarea and results section.
     * @private
     */
    #clearSql() {
        if (this.elem.textarea) {
            this.elem.textarea.value = '';
        }
        if (this.elem.results) {
            this.elem.results.innerHTML = '';
        }
    }

    /**
     * Connects HTML elements to corresponding properties and adds event listeners.
     * @private
     */
    #connectHtmlElements() {
        this.elem.clear = document.getElementById('sql-clear');
        this.elem.history = document.getElementById('sql-history');
        this.elem.results = document.getElementById('sql-results');
        this.elem.run = document.getElementById('sql-run');
        this.elem.textarea = document.getElementById('sql-textarea');

        this.elem.clear.addEventListener('click', this.#clearSql.bind(this));
        this.elem.run.addEventListener('click', this.#runSql.bind(this));
    }

    /**
     * Generates the table header for a given array of objects.
     * @private
     * @param {Array} arr - The array of objects for which to generate the table header.
     * @return {string} - The HTML string representing the table header.
     */
    #getTableHeader(arr) {
        if(this.whatIs(arr) !== 'array') {
            return '';
        }

        if(this.whatIs(arr[0]) !== 'object') {
            return '';
        }

        let head = '<tr>';
        Object.keys(arr[0]).forEach((key) => {
            head += `<th>${key}</th>`;
        });
        head += '</tr>';

        return head;
    }

    /**
     * Handles the response received from the WebSocket server.
     * Updates the results section with the query results or error message.
     * @private
     * @param {Object} msgObj - The WebSocket message object.
     */
    #response(msgObj) {
        this.elem.results.classList.remove('error');

        if (msgObj.type === 'string') {
            this.elem.results.classList.add('error');
            this.elem.results.innerHTML = msgObj.message;
            return;
        }

        let table = '<table>';
        table += this.#getTableHeader(msgObj.message);
        msgObj.message.forEach((row) => {
            table += '<tr>';
            Object.values(row).forEach((value) => {
                table += `<td>${value}</td>`;
            }); 
            table += '</tr>';
        });
        table += '</table>';

        this.elem.results.innerHTML = table;
    }

    /**
     * Runs the SQL query entered in the textarea.
     * Adds the query to the history and sends it to the server.
     * @private
     */
    #runSql() {
        if (this.elem.textarea) {
            const sql = this.elem.textarea.value.trim();
            this.#addToHistory(sql);
            this.#sendQuery(sql);
        }
    }

    /**
     * Sends a SQL query to the WebSocket server for database processing.
     * @private
     * @param {string} query - The SQL query to be sent.
     * @param {Array} queryParams - The parameters for the query (optional).
     */
    #sendQuery(query, queryParams = []) {
        const message = {
            query,
            queryParams
        };
        NSS_WS.send(message, 'database');
    }

    /**
     * The fastest way to get the actual type of anything in JavaScript.
     * See benchmarks: {@link https://jsbench.me/ruks9jljcu/2}
     * @param {*} unknown - Anything you wish to check the type of.
     * @return {string|undefined} - The type in lowercase of the unknown value passed in or undefined.
     */
    whatIs(unknown) {
        try {
            return ({}).toString.call(unknown).match(/\s([^\]]+)/)[1].toLowerCase();
        } catch (e) { return undefined; }
    }

}

// Create an instance of DatabaseConnector when the script is executed.
const databaseConnector = new DatabaseConnector();
