const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'http_dogs'
};

const SECRET_KEY = 'your-secret-key-here';

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
async function query(sql, params) {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release();
    }
}

// Authentication middleware
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Routes
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        await query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find user
        const [user] = await query('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.get('/api/search', authenticate, async (req, res) => {
    const filter = req.query.filter;
    
    if (!filter) {
        return res.status(400).json({ message: 'Filter is required' });
    }
    
    try {
        // Convert filter to regex pattern
        let pattern = filter
            .replace(/x/g, '\\d')
            .replace(/\*/g, '\\d*');
        
        // Get all possible HTTP status codes (in a real app, you might have a predefined list)
        const allCodes = Array.from({ length: 599 }, (_, i) => i + 1);
        
        // Filter codes based on pattern
        const regex = new RegExp(`^${pattern}$`);
        const matchedCodes = allCodes.filter(code => regex.test(code.toString()));
        
        // Format response
        const results = matchedCodes.map(code => ({
            code,
            image_url: `https://http.dog/${code}.jpg`
        }));
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
});

app.post('/api/lists', authenticate, async (req, res) => {
    const { name, response_codes } = req.body;
    
    if (!name || !response_codes || !Array.isArray(response_codes)) {
        return res.status(400).json({ message: 'Name and response_codes are required' });
    }
    
    try {
        // Save list
        const result = await query(
            'INSERT INTO lists (user_id, name, response_codes) VALUES (?, ?, ?)',
            [req.userId, name, JSON.stringify(response_codes)]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            name,
            response_codes,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Save list error:', error);
        res.status(500).json({ message: 'Server error while saving list' });
    }
});

app.get('/api/lists', authenticate, async (req, res) => {
    try {
        const lists = await query(
            'SELECT id, name, response_codes, created_at FROM lists WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        
        // Parse JSON data
        const formattedLists = lists.map(list => ({
            ...list,
            response_codes: JSON.parse(list.response_codes)
        }));
        
        res.json(formattedLists);
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({ message: 'Server error while fetching lists' });
    }
});

app.delete('/api/lists/:id', authenticate, async (req, res) => {
    const listId = req.params.id;
    
    try {
        // Verify list belongs to user
        const [list] = await query(
            'SELECT id FROM lists WHERE id = ? AND user_id = ?',
            [listId, req.userId]
        );
        
        if (!list) {
            return res.status(404).json({ message: 'List not found or not owned by user' });
        }
        
        // Delete list
        await query('DELETE FROM lists WHERE id = ?', [listId]);
        
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Delete list error:', error);
        res.status(500).json({ message: 'Server error while deleting list' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});