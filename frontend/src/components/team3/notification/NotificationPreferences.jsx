import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationPreferences = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    in_app_enabled: true,
    frequency: 'immediate',
    quiet_hours_start: '',
    quiet_hours_end: '',
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8000/notification-groups/');
      setGroups(response.data);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/notification-preferences/', {
        user_id: userId,
        group_id: selectedGroup,
        ...preferences,
      });
      setError(null);
    } catch (err) {
      setError('Failed to save preferences');
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="email_enabled"
            checked={preferences.email_enabled}
            onChange={(e) => setPreferences(prev => ({ ...prev, email_enabled: e.target.checked }))}
          />
          <label htmlFor="email_enabled">Enable Email Notifications</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="in_app_enabled"
            checked={preferences.in_app_enabled}
            onChange={(e) => setPreferences(prev => ({ ...prev, in_app_enabled: e.target.checked }))}
          />
          <label htmlFor="in_app_enabled">Enable In-App Notifications</label>
        </div>

        <select
          value={preferences.frequency}
          onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value }))}
          className="w-full p-2 border rounded"
        >
          <option value="immediate">Immediate</option>
          <option value="daily">Daily Digest</option>
          <option value="weekly">Weekly Digest</option>
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            value={preferences.quiet_hours_start}
            onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
            className="p-2 border rounded"
            placeholder="Quiet Hours Start"
          />
          <input
            type="time"
            value={preferences.quiet_hours_end}
            onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
            className="p-2 border rounded"
            placeholder="Quiet Hours End"
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Save Preferences
        </button>
      </form>
    </div>
  );
};

export default NotificationPreferences;