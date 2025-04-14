import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';


const NotificationForm = ({ userId, onNotificationCreated }) => {

  const [formData, setFormData] = useState({
    type: 'reminder',
    title:'',
    message: '',
    metadata: '',
    group_id: ''
  });
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: userId,
        title: formData.title,
        type: formData.type,
        message: formData.message,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
      };
      await axios.post('http://localhost:8000/notifications/', payload);      setFormData({ type: 'reminder', message: '', metadata: '' });
      if (onNotificationCreated) onNotificationCreated();
      setError(null);
    } catch (err) {
      setError('Failed to create notification');
      console.error(err);
    }
  };
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:8000/notification-groups/');
        setGroups(response.data);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-semibold mb-2">Create Notification</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
  <input
    name="title"
    value={formData.title}
    onChange={handleChange}
    placeholder="Enter title"
    className="w-full p-2 border rounded"
    required
  />
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
  <select
  name="group_id"
  value={formData.group_id}
  onChange={handleChange}
  className="w-full p-2 border rounded"
>
  <option value="">Select Group (Optional)</option>
  {groups.map(group => (
    <option key={group.id} value={group.id}>{group.name}</option>
  ))}
</select>

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