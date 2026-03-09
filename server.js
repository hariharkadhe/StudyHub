const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase Client initialized");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));

// HTML Routes
const serveHTML = (route, fileName) => {
    app.get(route, (req, res) => {
        const filePath = path.join(__dirname, 'public', fileName);
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html');
            res.send(fs.readFileSync(filePath));
        } else {
            res.status(404).send("HTML File Missing");
        }
    });
};

serveHTML('/', 'index.html');
serveHTML('/dashboard', 'dashboard.html');
serveHTML('/upload', 'upload.html');
serveHTML('/admin', 'admin.html');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER START <<<`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`MODE: SUPABASE CLOUD`);
});
