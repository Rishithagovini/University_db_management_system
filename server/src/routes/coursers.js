
const coursesRouter = require('express').Router();
// GET route to fetch all courses, including department and instructor details
coursesRouter.get('/', async (req, res) => {
    try {
        const allCourses = await pool.query(`
            SELECT c.*, d.department_name, i.instructor_name 
            FROM courses c 
            JOIN departments d ON c.department_id = d.department_id 
            JOIN instructors i ON c.instructor_id = i.instructor_id
        `);
        res.json(allCourses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
// POST route to add a new course
coursesRouter.post('/', async (req, res) => {
    try {
        const { course_name, department_id, instructor_id } = req.body;
        const newCourse = await pool.query(
            'INSERT INTO courses (course_name, department_id, instructor_id) VALUES ($1, $2, $3) RETURNING *',
            [course_name, department_id, instructor_id]
        );
        res.json(newCourse.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
// Import express router to handle routes related to enrollments
const enrollmentsRouter = require('express').Router();
// GET route to fetch all enrollments with student and course details
enrollmentsRouter.get('/', async (req, res) => {
    try {
        const allEnrollments = await pool.query(`
            SELECT e.*, s.student_name, c.course_name 
            FROM enrollments e 
            JOIN students s ON e.student_id = s.student_id 
            JOIN courses c ON e.course_id = c.course_id
        `);
        res.json(allEnrollments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
// POST route to add a new enrollment
enrollmentsRouter.post('/', async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const newEnrollment = await pool.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
            [student_id, course_id]
        );
        res.json(newEnrollment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
