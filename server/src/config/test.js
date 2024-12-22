
// Import necessary libraries
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
// Create an instance of the Express app
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Delete route
app.delete('/api/students/:id', async (req, res) => {
    const id = req.params.id;
    console.log('Received delete request for student:', id);
    
    try {
        const result = await pool.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
