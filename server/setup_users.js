
const { db } = require('./db');
const bcrypt = require('bcryptjs');

const setupUsers = () => {
    console.log('--- Setting up Users (Safe Mode) ---');

    // Helper to create or update user
    const upsertUser = (username, role, password) => {
        const hash = bcrypt.hashSync(password, 10);
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

        if (existing) {
            db.prepare('UPDATE users SET password_hash = ?, role = ? WHERE id = ?').run(hash, role, existing.id);
            console.log(`Updated user: ${username}`);
            return existing.id;
        } else {
            const res = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role);
            console.log(`Created user: ${username}`);
            return res.lastInsertRowid;
        }
    };

    // 1. Ensure Miguel exists (Admin)
    const miguelId = upsertUser('Miguel', 'admin', 'adminMiguel2026');

    // 2. Reassign ALL leads to Miguel to avoid foreign key constraints when deleting others
    db.prepare('UPDATE leads SET assigned_to = ? WHERE assigned_to IS NOT NULL').run(miguelId);
    console.log(`Reassigned all leads to Miguel (ID: ${miguelId})`);

    // 3. Delete defaults if they are NOT Miguel
    const defaults = ['admin', 'boss', 'sales'];
    defaults.forEach(defName => {
        if (defName !== 'Miguel') {
            db.prepare('DELETE FROM users WHERE username = ?').run(defName);
        }
    });

    // 4. Create other users
    upsertUser('Cristobal', 'boss', 'bossCristobal2026');
    upsertUser('Vendedor1', 'sales', 'salesUser2026');

    const allUsers = db.prepare('SELECT id, username, role FROM users').all();
    console.log('--- Current Users ---');
    console.table(allUsers);
};

setupUsers();
