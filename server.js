const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;   // ✅ Render compatible
const DATA_FILE = path.join(__dirname, 'database.json');

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', () => {
            try {
                const newEntry = JSON.parse(body);
                newEntry.id = Date.now();

                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                data.push(newEntry);
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
