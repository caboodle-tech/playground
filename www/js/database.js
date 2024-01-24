class DatabaseConnector {

    elem = {
        clear: null,
        history: null,
        results: null,
        run: null,
        textarea: null
    }

    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            NSS_WS.registerCallback(this.#response.bind(this));
            this.#connectHtmlElements();
        });
    }

    #addToHistory(sql) {
        const record = document.createElement('div');
        record.classList.add('sql-history-record');
        record.innerHTML = sql;

        record.addEventListener("dblclick", () => {
            this.elem.textarea.value = sql;
            this.elem.run.click();
        });

        this.elem.history.prepend(record);
    }

    #clearSql() {
        if (this.elem.textarea) {
            this.elem.textarea.value = '';
        }
        if (this.elem.results) {
            this.elem.results.innerHTML = '';
        }
    }

    #connectHtmlElements() {
        this.elem.clear = document.getElementById('sql-clear');
        this.elem.history = document.getElementById('sql-history');
        this.elem.results = document.getElementById('sql-results');
        this.elem.run = document.getElementById('sql-run');
        this.elem.textarea = document.getElementById('sql-textarea');

        this.elem.clear.addEventListener('click', this.#clearSql.bind(this));
        this.elem.run.addEventListener('click', this.#runSql.bind(this));
    }

    #getTableHeader(arr) {
        if(this.whatIs(arr) != 'array') {
            return '';
        }

        if(this.whatIs(arr[0]) != 'object') {
            return '';
        }

        let head = '<tr>';
        Object.keys(arr[0]).forEach((key) => {
            head += `<th>${key}</th>`;
        });
        head += '</tr>';

        return head;
    }

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

    #runSql() {
        if (this.elem.textarea) {
            const sql = this.elem.textarea.value.trim();
            this.#addToHistory(sql);
            this.#sendQuery(sql);
        }
    }

    #sendQuery(query, queryParams = []) {
        const message = {
            query,
            queryParams
        };
        NSS_WS.send(message, 'database');
    }

    /**
     * The fastest way to get the actual type of anything in JavaScript.
     *
     * {@link https://jsbench.me/ruks9jljcu/2 | See benchmarks}.
     *
     * @param {*} unknown Anything you wish to check the type of.
     * @return {string|undefined} The type in lowercase of the unknown value passed in or undefined.
     */
    whatIs(unknown) {
        try {
            return ({}).toString.call(unknown).match(/\s([^\]]+)/)[1].toLowerCase();
        } catch (e) { return undefined; }
    }

}

const databaseConnector = new DatabaseConnector();