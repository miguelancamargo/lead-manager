const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

// 1. Fix Logo
const src = String.raw`C:\Users\Usuario\.gemini\antigravity\brain\b551c1ee-4bf6-4d10-a140-92e692ab449a\uploaded_image_1_1768101545409.png`;
const dest = String.raw`C:\Users\Usuario\.gemini\antigravity\scratch\lead-manager\client\public\teybot-logo.png`;

try {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Logo copied successfully.');
    } else {
        console.error('Source logo not found at:', src);
    }
} catch (err) {
    console.error('Error copying logo:', err);
}

// 2. Update User 'boss' to 'Cristobal'
try {
    const dbPath = path.resolve(__dirname, 'server/leads.db');
    const db = new Database(dbPath);

    const update = db.prepare("UPDATE users SET username = 'Cristobal' WHERE username = 'boss'");
    const info = update.run();
    console.log(`Updated user 'boss' to 'Cristobal'. Changes: ${info.changes}`);
} catch (err) {
    console.error('Error updating DB:', err);
}
