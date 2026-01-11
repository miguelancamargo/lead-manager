const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Middleware to verify token (simplified)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Malformed token' });

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// GET all leads (filtered by role potentially)
router.get('/', verifyToken, (req, res) => {
    try {
        let stmt;
        if (req.user.role === 'sales') {
            // Sales can see all or only assigned? "gestionarse desde el mismo aplicativo" - implies seeing them.
            // Usually sales sees all available leads or their own. Let's return all for now to let them manage.
            stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
        } else {
            stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
        }

        const leads = stmt.all();

        // Calculate temperature on the fly
        const now = new Date();
        const enrichedLeads = leads.map(lead => {
            const created = new Date(lead.created_at);
            const diffDays = (now - created) / (1000 * 60 * 60 * 24);
            let temp = 'Hot';
            if (diffDays > 2) temp = 'Warm';
            if (diffDays > 7) temp = 'Cold';

            // Allow override if stored in DB (though we calculate it dynamically here as requested "calculate based on date")
            return { ...lead, temperature: temp };
        });

        res.json(enrichedLeads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE lead
router.post('/', verifyToken, (req, res) => {
    const { first_name, last_name, phone, observations, answered_whatsapp, answered_phone, demo_scheduled } = req.body;

    // Validate required
    if (!first_name || !phone) return res.status(400).json({ error: 'Name and Phone required' });

    try {
        const stmt = db.prepare(`
            INSERT INTO leads (first_name, last_name, phone, observations, answered_whatsapp, answered_phone, demo_scheduled, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            first_name,
            last_name || '',
            phone,
            observations || '',
            answered_whatsapp ? 1 : 0,
            answered_phone ? 1 : 0,
            demo_scheduled ? 1 : 0,
            req.user.id // Assign to creator initially?
        );
        res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE lead
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone, observations, answered_whatsapp, answered_phone, demo_scheduled } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE leads SET 
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                phone = COALESCE(?, phone),
                observations = COALESCE(?, observations),
                answered_whatsapp = COALESCE(?, answered_whatsapp),
                answered_phone = COALESCE(?, answered_phone),
                demo_scheduled = COALESCE(?, demo_scheduled)
            WHERE id = ?
        `);

        const info = stmt.run(
            first_name, last_name, phone, observations,
            answered_whatsapp === undefined ? null : (answered_whatsapp ? 1 : 0),
            answered_phone === undefined ? null : (answered_phone ? 1 : 0),
            demo_scheduled === undefined ? null : (demo_scheduled ? 1 : 0),
            id
        );

        if (info.changes === 0) return res.status(404).json({ error: 'Lead not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BULK IMPORT
router.post('/bulk', verifyToken, (req, res) => {
    const { leads } = req.body; // Expecting array of objects
    if (!Array.isArray(leads)) return res.status(400).json({ error: 'Invalid format' });

    const insert = db.prepare(`
        INSERT INTO leads (first_name, last_name, phone, observations, created_at)
        VALUES (@first_name, @last_name, @phone, @observations, @created_at)
    `);

    const insertMany = db.transaction((leads) => {
        for (const lead of leads) {
            // Default values if missing
            insert.run({
                first_name: lead.first_name || 'Agente',
                last_name: lead.last_name || '',
                phone: lead.phone || '',
                observations: lead.observations || '',
                created_at: lead.created_at || new Date().toISOString()
            });
        }
    });

    try {
        insertMany(leads);
        res.json({ success: true, count: leads.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
