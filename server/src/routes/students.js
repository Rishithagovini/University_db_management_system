
const router = require('express').Router();
const pool = require('../config/db');

// Get all students
router.get('/', async (req, res) => {
    try {
        const allStudents = await pool.query('SELECT * FROM students');
        res.json(allStudents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// Get a student by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await pool.query('SELECT * FROM students WHERE student_id = $1', [id]);
        res.json(student.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// Add a new student
router.post('/', async (req, res) => {
    try {
        const { student_name, email, phone_number } = req.body;
        const newStudent = await pool.query(
            'INSERT INTO students (student_name, email, phone_number) VALUES ($1, $2, $3) RETURNING *',
            [student_name, email, phone_number]
        );
        res.json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;
