
const router = require('express').Router();
const pool = require('../config/db');

// GET route to fetch all departments
router.get('/', async (req, res) => {
    try {
        const allDepartments = await pool.query('SELECT * FROM departments');
        res.json(allDepartments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
// POST route to create a new department
router.post('/', async (req, res) => {
    try {
        const { department_name, head_id } = req.body;
        const newDepartment = await pool.query(
            'INSERT INTO departments (department_name, head_id) VALUES ($1, $2) RETURNING *',
            [department_name, head_id]
        );
        res.json(newDepartment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});


