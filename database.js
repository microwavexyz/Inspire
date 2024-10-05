const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite database file
const db = new sqlite3.Database(path.resolve(__dirname, 'vouches.db'), (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create the vouches table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS vouches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vouchedUserId TEXT NOT NULL,
            vouchedById TEXT NOT NULL,
            vouchedByTag TEXT NOT NULL,
            message TEXT
        )`);
    }
});

module.exports = db;
