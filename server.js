const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'database.json');

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    // Set CORS headers so the browser allows the request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newEntry = JSON.parse(body);
                newEntry.id = Date.now();

                // Read, Update, and Save JSON file
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                data.push(newEntry);
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Saved to JSON file successfully!' }));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Your data will be saved in: ${DATA_FILE}`);
});