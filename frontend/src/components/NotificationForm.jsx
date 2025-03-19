import React, { useState } from 'react';
import axios from 'axios';

const NotificationForm = ({ userId, onNotificationCreated }) => {
  const [formData, setFormData] = useState({
    type: 'reminder',
    message: '',
    metadata: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: userId,
        type: formData.type,
        message: formData.message,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
      };
      await axios.post('http://localhost:8000/notifications/', payload);
      setFormData({ type: 'reminder', message: '', metadata: '' });
      if (onNotificationCreated) onNotificationCreated();
      setError(null);
    } catch (err) {
      setError('Failed to create notification');
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-semibold mb-2">Create Notification</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="reminder">Reminder</option>
          <option value="alert">Alert</option>
          <option value="update">Update</option>
        </select>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Enter message"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="metadata"
          value={formData.metadata}
          onChange={handleChange}
          placeholder='Enter metadata as JSON (e.g., {"session_id": "123"})'
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default NotificationForm;