import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EntityManager = ({ entityType, fields }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const initializeFormData = () => {
      const initialData = {};
      fields.forEach(field => initialData[field.name] = '');
      setFormData(initialData);
    };
    initializeFormData();
    fetchItems();
  }, [entityType, fields]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${entityType}`);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${entityType}:`, error);
      alert(`Error fetching ${entityType}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/${entityType}/${editingItem.id}`, formData);
        alert(`${entityType} updated successfully`);
        setEditingItem(null);
      } else {
        await axios.post(`http://localhost:5000/api/${entityType}`, formData);
        alert(`${entityType} added successfully`);
      }
      const initialData = {};
      fields.forEach(field => initialData[field.name] = '');
      setFormData(initialData);
      fetchItems();
    } catch (error) {
      console.error(`Error ${editingItem ? 'updating' : 'adding'} ${entityType}:`, error);
      alert(`Failed to ${editingItem ? 'update' : 'add'} ${entityType}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${entityType}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/${entityType}/${id}`);
        setItems(items.filter(item => item.id !== id));
        alert(`${entityType} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting ${entityType}:`, error);
        alert('Failed to delete');
        fetchItems();
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    fields.forEach(field => editData[field.name] = item[field.name]);
    setFormData(editData);
  };

  const filteredItems = items.filter(item =>
    fields.some(field => 
      String(item[field.name]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="section">
      <h2>{entityType.charAt(0).toUpperCase() + entityType.slice(1)} Management</h2>
      
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
        {fields.map(field => (
          <div key={field.name} className="form-group">
            <input
              type={field.type || 'text'}
              placeholder={field.label}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              required={field.required !== false}
            />
          </div>
        ))}

        <button type="submit">
          {editingItem ? `Update ${entityType}` : `Add ${entityType}`}
        </button>

        {editingItem && (
          <button 
            type="button"
            onClick={() => {
              setEditingItem(null);
              const resetData = {};
              fields.forEach(field => resetData[field.name] = '');
              setFormData(resetData);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            {fields.map(field => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              {fields.map(field => (
                <td key={field.name}>{item[field.name]}</td>
              ))}
              <td>
                <button onClick={() => handleEdit(item)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};