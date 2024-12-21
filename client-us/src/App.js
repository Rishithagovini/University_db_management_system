import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
/**
 * EntityManager Component
 * Manages CRUD operations for different entities (students, courses, etc.)
 * @param {Object} entityType - The type of entity (e.g., 'students', 'courses')
 * @param {Array} fields - Fields configuration for the entity form (e.g., name, type, etc.)
 * Developer: Anjana Priya Bachina and Nikhitha Dadi
 * Last Modified: 29-11-2024
 */
function EntityManager({ entityType, fields }) {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingEnrollments, setViewingEnrollments] = useState(null);
 // Initialize form data and fetch data on component mount or field/entityType change
  React.useEffect(() => {
    const initializeFormData = () => {
      const initialData = {};
      fields.forEach((field) => (initialData[field.name] = ''));
      setFormData(initialData);
    };
    initializeFormData();
    fetchData();
  }, [entityType, fields]);
// Fetch data for entities and their select field options
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [itemsResponse, ...optionsResponses] = await Promise.all([
        axios.get(`http://localhost:5000/api/${entityType}`, { headers }),
        ...fields
          .filter(field => field.type === 'select')
          .map(field => 
            axios.get(`http://localhost:5000/api/${field.options}`, { headers })
          )
      ]);
// Map options to their corresponding select fields
      const optionsData = {};
      fields
        .filter(field => field.type === 'select')
        .forEach((field, index) => {
          optionsData[field.options] = optionsResponses[index].data;
        });

      setItems(itemsResponse.data);
      setOptions(optionsData);
      setError('');
    } catch (err) {
      console.error(`Error fetching data:`, err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
// Handle form submission for adding or updating items
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
 // Update existing item or add new item based on editingItem state
      if (editingItem) {
        const idField = `${entityType.slice(0, -1)}_id`;
        await axios.put(
          `http://localhost:5000/api/${entityType}/${editingItem[idField]}`,
          formData,
          { headers }
        );
        setEditingItem(null);
      } else {
        await axios.post(`http://localhost:5000/api/${entityType}`, formData, { headers });
      }
      
      fetchData();
      const initialData = {};
      fields.forEach((field) => (initialData[field.name] = ''));
      setFormData(initialData);
    } catch (err) {
      setError(`Error ${editingItem ? 'updating' : 'adding'} ${entityType}`);
    }
  };
// Handle item deletion
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${entityType}?`)) {
      try {
        const token = localStorage.getItem('token');
        const idField = `${entityType.slice(0, -1)}_id`;
        await axios.delete(
          `http://localhost:5000/api/${entityType}/${item[idField]}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
      } catch (err) {
        setError(`Error deleting ${entityType}`);
      }
    }
  };
// Get the display value for a field
  const getDisplayValue = (item, field) => {
    if (field.type === 'select' && options[field.options]) {
      const relatedItem = options[field.options].find(
        option => option[field.valueField] === Number(item[field.name])
      );
      return relatedItem ? relatedItem[field.labelField] : '';
    }
    return item[field.name];
  };

  return (
    <div className="section">
      <h2>{entityType.charAt(0).toUpperCase() + entityType.slice(1)} Management</h2>
      
      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${entityType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <form onSubmit={handleSubmit} className="form">
        {fields.map((field) => (
          <div key={field.name} className="form-group">
            {field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
                className="select-input"
              >
                <option value="">Select {field.label}</option>
                {options[field.options]?.map(option => (
                  <option key={option[field.valueField]} value={option[field.valueField]}>
                    {option[field.labelField]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                placeholder={field.label}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
                className="form-input"
              />
            )}
          </div>
        ))}
        <button type="submit" className="submit-button">
          {editingItem ? 'Update' : 'Add'} {entityType}
        </button>
        {editingItem && (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              const initialData = {};
              fields.forEach((field) => (initialData[field.name] = ''));
              setFormData(initialData);
            }}
            className="cancel-button"
          >
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((item) =>
              fields.some((field) =>
                String(getDisplayValue(item, field) || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((item) => {
              const idField = `${entityType.slice(0, -1)}_id`;
              return (
                <tr key={item[idField]}>
                  {fields.map((field) => (
                    <td key={`${item[idField]}-${field.name}`}>{getDisplayValue(item, field)}</td>
                  ))}
                  <td className="action-buttons">
                    {entityType === 'students' && (
                      <button 
                        onClick={() => setViewingEnrollments(item.student_id)}
                        className="view-button"
                      >
                        View Enrollments
                      </button>
                    )}
                    <button onClick={() => {
                      setEditingItem(item);
                      const initialData = {};
                      fields.forEach((field) => {
                        initialData[field.name] = item[field.name] || '';
                      });
                      setFormData(initialData);
                    }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item)}>Delete</button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
/**
 * Login Component
 * Handles user authentication and login process
 * Developer: Anjana Priya Bachina and Nikhitha Dadi
 * Last Modified: 29-11-2024
 */
function Login({ setIsAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setIsAuth(true);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-section">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

const App = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  const entityConfigs = {
    students: {
      fields: [
        { name: 'student_name', label: 'Student Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone_number', label: 'Phone Number', required: true },
      ],
    },
    courses: {
      fields: [
        { name: 'course_name', label: 'Course Name', required: true },
        { 
          name: 'department_id', 
          label: 'Department',
          type: 'select',
          required: true,
          options: 'departments',
          valueField: 'department_id',
          labelField: 'department_name'
        },
        { 
          name: 'instructor_id', 
          label: 'Instructor',
          type: 'select',
          required: true,
          options: 'instructors',
          valueField: 'instructor_id',
          labelField: 'instructor_name'
        },
      ],
    },
    departments: {
      fields: [
        { name: 'department_name', label: 'Department Name', required: true },
        { 
          name: 'head_id', 
          label: 'Department Head',
          type: 'select',
          required: true,
          options: 'instructors',
          valueField: 'instructor_id',
          labelField: 'instructor_name'
        },
      ],
    },
    instructors: {
      fields: [
        { name: 'instructor_name', label: 'Instructor Name', required: true },
        { 
          name: 'department_id', 
          label: 'Department',
          type: 'select',
          required: true,
          options: 'departments',
          valueField: 'department_id',
          labelField: 'department_name'
        },
      ],
    },
  };

  const AuthGuard = ({ children }) => {
    return isAuth ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>University Management System</h1>
          <div className="nav-links">
            {!isAuth ? (
              <Link to="/login">Login</Link>
            ) : (
              <>
                <Link to="/">Dashboard</Link>
                {Object.keys(entityConfigs).map((entity) => (
                  <Link key={entity} to={`/${entity}`}>
                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
                  </Link>
                ))}
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            {Object.entries(entityConfigs).map(([entity, config]) => (
              <Route
                key={entity}
                path={`/${entity}`}
                element={
                  <AuthGuard>
                    <EntityManager entityType={entity} fields={config.fields} />
                  </AuthGuard>
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;