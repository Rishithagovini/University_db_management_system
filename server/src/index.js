// developer(s): Anjana Priya Bachina and Nikhitha Dadi
// last modified: 29-11-2024
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    jwt.verify(token, 'abc123');
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, 'abc123', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Student Routes
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY student_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  const { student_name, email, phone_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO students (student_name, email, phone_number) VALUES ($1, $2, $3) RETURNING *',
      [student_name, email, phone_number]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', authenticateToken, async (req, res) => {
  const { student_name, email, phone_number } = req.body;
  try {
    const result = await pool.query(
      'UPDATE students SET student_name = $1, email = $2, phone_number = $3 WHERE student_id = $4 RETURNING *',
      [student_name, email, phone_number, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM enrollments WHERE student_id = $1', [req.params.id]);
    await pool.query('DELETE FROM students WHERE student_id = $1', [req.params.id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Department Routes
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, i.instructor_name as head_name 
      FROM departments d
      LEFT JOIN instructors i ON d.head_id = i.instructor_id
      ORDER BY d.department_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
  const { department_name, head_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO departments (department_name, head_id) VALUES ($1, $2) RETURNING *',
      [department_name, head_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/departments/:id', authenticateToken, async (req, res) => {
  const { department_name, head_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE departments SET department_name = $1, head_id = $2 WHERE department_id = $3 RETURNING *',
      [department_name, head_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE department_id = $1', [req.params.id]);
    await pool.query('UPDATE instructors SET department_id = NULL WHERE department_id = $1', [req.params.id]);
    await pool.query('DELETE FROM departments WHERE department_id = $1', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Instructor Routes
app.get('/api/instructors', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, d.department_name 
      FROM instructors i
      LEFT JOIN departments d ON i.department_id = d.department_id
      ORDER BY i.instructor_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/instructors', authenticateToken, async (req, res) => {
  const { instructor_name, department_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO instructors (instructor_name, department_id) VALUES ($1, $2) RETURNING *',
      [instructor_name, department_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/instructors/:id', authenticateToken, async (req, res) => {
  const { instructor_name, department_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE instructors SET instructor_name = $1, department_id = $2 WHERE instructor_id = $3 RETURNING *',
      [instructor_name, department_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/instructors/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE departments SET head_id = NULL WHERE head_id = $1', [req.params.id]);
    await pool.query('UPDATE courses SET instructor_id = NULL WHERE instructor_id = $1', [req.params.id]);
    await pool.query('DELETE FROM instructors WHERE instructor_id = $1', [req.params.id]);
    res.json({ message: 'Instructor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Course Routes
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, d.department_name, i.instructor_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      ORDER BY c.course_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
  const { course_name, department_id, instructor_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (course_name, department_id, instructor_id) VALUES ($1, $2, $3) RETURNING *',
      [course_name, department_id, instructor_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  const { course_name, department_id, instructor_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE courses SET course_name = $1, department_id = $2, instructor_id = $3 WHERE course_id = $4 RETURNING *',
      [course_name, department_id, instructor_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM enrollments WHERE course_id = $1', [req.params.id]);
    await pool.query('DELETE FROM courses WHERE course_id = $1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enrollment Routes
app.get('/api/enrollments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        s.student_name,
        c.course_name,
        d.department_name,
        i.instructor_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN instructors i ON c.instructor_id = i.instructor_id
      ORDER BY s.student_name, c.course_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/enrollments', authenticateToken, async (req, res) => {
  const { student_id, course_id } = req.body;
  try {
    // Check if enrollment exists
    const existing = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }

    const result = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [student_id, course_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/enrollments/:studentId/:courseId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.params.studentId, req.params.courseId]
    );
    res.json({ message: 'Enrollment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Enrollments
app.get('/api/students/:id/enrollments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.course_id,
        c.course_name,
        d.department_name,
        i.instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN instructors i ON c.instructor_id = i.instructor_id
      WHERE e.student_id = $1
      ORDER BY c.course_name
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Course Enrollments
app.get('/api/courses/:id/enrollments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.student_id,
        s.student_name,
        s.email,
        s.phone_number
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      WHERE e.course_id = $1
      ORDER BY s.student_name
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats Route for Dashboard
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM students) AS student_count,
        (SELECT COUNT(*) FROM instructors) AS instructor_count,
        (SELECT COUNT(*) FROM courses) AS course_count,
        (SELECT COUNT(*) FROM departments) AS department_count
    `);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));