import React, { useState } from 'react';
import axios from 'axios';

const NotificationGroupForm = ({ onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/notification-groups/', formData);
      setFormData({ name: '', description: '' });
      if (onGroupCreated) onGroupCreated();
      setError(null);
    } catch (err) {
      setError('Failed to create notification group');
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-semibold mb-2">Create Notification Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Group Name"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default NotificationGroupForm;