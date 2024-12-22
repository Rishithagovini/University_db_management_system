
// Import the Pool class from the pg module
const { Pool } = require('pg');
// Create a new Pool instance with database connection configuration
const pool = new Pool({
    user: 'username',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'college_db'
});

// Test database connection by acquiring a client from the pool
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Connected to Database at:', result.rows[0].now);
    });
});
// Export the pool object for use in other parts of the application
module.exports = pool;
