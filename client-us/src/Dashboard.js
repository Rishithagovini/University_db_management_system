import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Dashboard component - Displays university statistics, allows quick enrollment, and manages enrollments.
const Dashboard = () => {
  const [stats, setStats] = useState({
    student_count: 0,
    instructor_count: 0,
    course_count: 0,
    department_count: 0,
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  // Fetch data when component mounts or navigate changes
  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);
  // Function to fetch dashboard data from the API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [statsRes, studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/stats', { headers }),
        axios.get('http://localhost:5000/api/students', { headers }),
        axios.get('http://localhost:5000/api/courses', { headers }),
        axios.get('http://localhost:5000/api/enrollments', { headers })
      ]);
      // Set state with fetched data
      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  // Function to handle enrollment of a student in a course

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) {
      setError('Please select both student and course');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      // Send POST request to enroll student
      await axios.post('http://localhost:5000/api/enrollments', {
        student_id: selectedStudent,
        course_id: selectedCourse
      }, { headers });
      // Reset form after successful enrollment
      setSelectedStudent('');
      setSelectedCourse('');
      setError('');
      setSuccessMessage('Student successfully enrolled!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll student');
    }
  };
// Function to handle unenrollment of a student from a course
  const handleUnenroll = async (studentId, courseId) => {
    if (window.confirm('Are you sure you want to unenroll this student?')) {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        await axios.delete(`http://localhost:5000/api/enrollments/${studentId}/${courseId}`, { headers });
        setSuccessMessage('Student successfully unenrolled!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchDashboardData();
      } catch (err) {
        setError('Failed to unenroll student');
      }
    }
  };
 // Card data for displaying various statistics
  const statCards = [
    { title: 'Students', count: stats.student_count, link: '/students', color: 'blue' },
    { title: 'Instructors', count: stats.instructor_count, link: '/instructors', color: 'green' },
    { title: 'Courses', count: stats.course_count, link: '/courses', color: 'purple' },
    { title: 'Departments', count: stats.department_count, link: '/departments', color: 'orange' },
  ];

  return (
    <div className="dashboard">
      <h2>University Dashboard</h2>
      {/* Loading, Error, and Success Message display */}

      {loading && <div className="loading-spinner">Loading data...</div>}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {/* Dashboard Statistics Cards */}
      <div className="dashboard-cards">
        {!loading && !error && statCards.map((card) => (
          <div key={card.title} className={`card card-${card.color}`}>
            <h3>{card.title}</h3>
            <p className="stat-number">{card.count}</p>
            <Link to={card.link} className="card-link">
              Manage {card.title}
            </Link>
          </div>
        ))}
      </div>
      {/* Quick Enrollment Form */}
      <div className="section enrollment-section">
        <h3>Quick Enrollment</h3>
        <form onSubmit={handleEnroll} className="enrollment-form">
          <div className="form-group">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="select-input"
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.student_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="select-input"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name} - {course.department_name}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="enroll-button">
            Enroll Student
          </button>
        </form>

        <div className="recent-enrollments">
          <h3>Recent Enrollments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Department</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.slice(0, 5).map((enrollment) => (
                <tr key={`${enrollment.student_id}-${enrollment.course_id}`}>
                  <td>{enrollment.student_name}</td>
                  <td>{enrollment.course_name}</td>
                  <td>{enrollment.department_name}</td>
                  <td>{enrollment.instructor_name}</td>
                  <td>
                    <button
                      onClick={() => handleUnenroll(enrollment.student_id, enrollment.course_id)}
                      className="unenroll-button"
                    >
                      Unenroll
                    </button>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No enrollments found</td>
                </tr>
              )}
            </tbody>
          </table>
          <Link to="/enrollments" className="view-all-link">View All Enrollments</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
