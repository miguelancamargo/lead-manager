const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.resolve(__dirname, 'leads.db');
    const db = new Database(dbPath);

    // Check if 'Cristobal' already exists to avoid unique constraint error if run multiple times
    const existing = db.prepare("SELECT * FROM users WHERE username = 'Cristobal'").get();

    if (!existing) {
        const update = db.prepare("UPDATE users SET username = 'Cristobal' WHERE username = 'boss'");
        const info = update.run();
        console.log(`Updated user 'boss' to 'Cristobal'. Changes: ${info.changes}`);
    } else {
        console.log("User 'Cristobal' already exists.");
    }

} catch (err) {
    console.error('Error updating DB:', err);
}
