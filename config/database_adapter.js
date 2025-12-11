const { Pool } = require('pg');

// Database adapter for Vercel deployment
// This will work with SSH tunnel or HTTP proxy

class DatabaseAdapter {
    constructor() {
        this.useHttpProxy = process.env.NODE_ENV === 'production';
        
        if (this.useHttpProxy) {
            // Production: Use HTTP proxy (setup through SSH tunnel)
            this.proxyUrl = process.env.DB_PROXY_URL || 'http://localhost:8000';
        } else {
            // Development: Direct connection through SSH tunnel
            this.pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5433,
                database: process.env.DB_NAME || 'timemanagement',
                user: process.env.DB_USER || 'sdadmin',
                password: process.env.DB_PASSWORD || '04D8lt1+9^sG/!Dj',
                ssl: false,
                connectionTimeoutMillis: 5000,
            });
        }
    }

    async query(text, params = []) {
        if (this.useHttpProxy) {
            return this._queryViaHttp(text, params);
        } else {
            const client = await this.pool.connect();
            try {
                const result = await client.query(text, params);
                return result;
            } finally {
                client.release();
            }
        }
    }

    async transaction(queries) {
        if (this.useHttpProxy) {
            return this._transactionViaHttp(queries);
        } else {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
                const results = [];
                for (const { query, params } of queries) {
                    const result = await client.query(query, params);
                    results.push(result);
                }
                await client.query('COMMIT');
                return results;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
    }

    async _queryViaHttp(query, params) {
        const response = await fetch(`${this.proxyUrl}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, params })
        });

        const result = await response.json();
        
        if (!result.success) {
            const error = new Error(result.error);
            error.code = result.code;
            throw error;
        }

        return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields
        };
    }

    async _transactionViaHttp(queries) {
        const response = await fetch(`${this.proxyUrl}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queries })
        });

        const result = await response.json();
        
        if (!result.success) {
            const error = new Error(result.error);
            throw error;
        }

        return result.results.map(r => ({
            rows: r.rows,
            rowCount: r.rowCount
        }));
    }

    async end() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

// Singleton instance
let dbAdapter = null;

const getDatabase = () => {
    if (!dbAdapter) {
        dbAdapter = new DatabaseAdapter();
    }
    return dbAdapter;
};

module.exports = { getDatabase, DatabaseAdapter };