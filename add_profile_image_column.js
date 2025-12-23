const { Client } = require('pg');

async function addProfileImageColumn() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'timemanagement',
    user: process.env.DB_USER || 'sdadmin',
    password: process.env.DB_PASSWORD || '04D8lt1+9^sG/!Dj',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if profile_image column already exists
    const checkColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_image';
    `;
    
    const result = await client.query(checkColumn);
    
    if (result.rows.length === 0) {
      // Add profile_image column
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN profile_image VARCHAR(500);
      `;
      
      await client.query(addColumnQuery);
      console.log('✅ Successfully added profile_image column to users table');
    } else {
      console.log('ℹ️ profile_image column already exists in users table');
    }

    // Show table structure to verify
    const tableInfo = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    const columns = await client.query(tableInfo);
    console.log('\n📋 Current users table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

  } catch (error) {
    console.error('❌ Error adding profile_image column:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  addProfileImageColumn()
    .then(() => {
      console.log('\n✨ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addProfileImageColumn };