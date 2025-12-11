const { Pool } = require('pg');

// Using SSH tunnel - connecting to localhost:5433
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'timemanagement',
    user: 'sdadmin',
    password: '04D8lt1+9^sG/!Dj',
    ssl: false
});

async function checkPostgreSQLConfig() {
    try {
        console.log('Checking PostgreSQL configuration...');
        
        const client = await pool.connect();
        
        // Check current settings
        const configFile = await client.query('SHOW config_file;');
        console.log('Config file location:', configFile.rows[0].config_file);
        
        const hbaFile = await client.query('SHOW hba_file;');
        console.log('HBA file location:', hbaFile.rows[0].hba_file);
        
        const listenAddresses = await client.query('SHOW listen_addresses;');
        console.log('Listen addresses:', listenAddresses.rows[0].listen_addresses);
        
        const port = await client.query('SHOW port;');
        console.log('PostgreSQL port:', port.rows[0].port);
        
        // Check pg_hba.conf rules
        try {
            const hbaRules = await client.query('SELECT * FROM pg_hba_file_rules;');
            console.log('\nCurrent HBA rules:');
            hbaRules.rows.forEach(rule => {
                console.log(`${rule.type} ${rule.database} ${rule.user_name} ${rule.address || 'N/A'} ${rule.auth_method}`);
            });
        } catch (err) {
            console.log('Could not read HBA rules:', err.message);
        }
        
        client.release();
        await pool.end();
        
    } catch (err) {
        console.error('❌ Error checking config:', err.message);
    }
}

checkPostgreSQLConfig();