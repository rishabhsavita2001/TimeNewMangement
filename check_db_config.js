const { Pool } = require('pg');

// Using SSH tunnel
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'timemanagement',
    user: 'sdadmin',
    password: '04D8lt1+9^sG/!Dj',
    ssl: false
});

async function configureDatabase() {
    try {
        const client = await pool.connect();
        
        console.log('🔧 Current PostgreSQL Configuration:');
        
        // Check current settings
        const listenAddresses = await client.query('SHOW listen_addresses;');
        console.log('Listen Addresses:', listenAddresses.rows[0].listen_addresses);
        
        const port = await client.query('SHOW port;');
        console.log('Port:', port.rows[0].port);
        
        // Check HBA rules
        const hbaRules = await client.query('SELECT * FROM pg_hba_file_rules WHERE type = \'host\';');
        console.log('\nCurrent HBA Host Rules:');
        hbaRules.rows.forEach(rule => {
            console.log(`${rule.type} ${rule.database || 'all'} ${rule.user_name || 'all'} ${rule.address || 'N/A'} ${rule.auth_method}`);
        });
        
        // Check if external access is already configured
        const externalRule = hbaRules.rows.find(rule => rule.address === '0.0.0.0/0' || rule.address === 'all');
        
        if (externalRule) {
            console.log('\n✅ PostgreSQL is already configured for external access!');
        } else {
            console.log('\n❌ PostgreSQL needs external access configuration.');
            console.log('📝 HBA file needs this line:');
            console.log('host    all             all             0.0.0.0/0               md5');
        }
        
        // Test if we can connect from different user
        try {
            const testResult = await client.query('SELECT current_user, inet_server_addr(), inet_server_port();');
            console.log('\nConnection Test:');
            console.log('Current User:', testResult.rows[0].current_user);
            console.log('Server Address:', testResult.rows[0].inet_server_addr);
            console.log('Server Port:', testResult.rows[0].inet_server_port);
        } catch (err) {
            console.log('Connection test failed:', err.message);
        }
        
        client.release();
        await pool.end();
        
    } catch (err) {
        console.error('❌ Configuration check failed:', err.message);
    }
}

configureDatabase();