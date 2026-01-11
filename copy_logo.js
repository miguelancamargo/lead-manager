import fs from 'fs';
import path from 'path';

const src = String.raw`C:\Users\Usuario\.gemini\antigravity\brain\b551c1ee-4bf6-4d10-a140-92e692ab449a\uploaded_image_1_1768101545409.png`;
const dest = String.raw`C:\Users\Usuario\.gemini\antigravity\scratch\lead-manager\client\public\teybot-logo.png`;

try {
    fs.copyFileSync(src, dest);
    console.log('Logo copied successfully to', dest);
} catch (err) {
    console.error('Error copying logo:', err);
}
