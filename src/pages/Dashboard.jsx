
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import GroupCard from '../components/GroupCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const getAuthHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};


const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://smart-expense-splitter-backend.vercel.app/api/groups', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      setGroups(data.groups || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://smart-expense-splitter-backend.vercel.app/api/groups', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      toast.success('Group created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '', category: 'other' });
      fetchGroups();
    } catch (error) {
      toast.error(error.message || 'Failed to create group');
    }
  };

  if (loading) return <LoadingSpinner message="Loading groups..." />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Your Groups</h1>
          <p>{groups.length} active groups</p>
        </div>
        <button onClick={() => setShowModal(true)} className="create-group-btn">
          + Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any groups yet. Create one to get started!</p>
          <button onClick={() => setShowModal(true)} className="create-group-btn">
            Create First Group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Group</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Summer Trip"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a description..."
                  rows="4"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="trip">Trip</option>
                  <option value="household">Household</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
