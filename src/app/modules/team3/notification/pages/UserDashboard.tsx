import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ListsWidget1,
  ListsWidget2,
  ListsWidget3,
  ListsWidget4,
  ListsWidget5,
  ListsWidget6,
  ListsWidget7,
  ListsWidget8,
} from '../../../../../_metronic/partials/widgets';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any> | null;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  members: string[];
}

interface Preferences {
  email_enabled: boolean;
  in_app_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface UserDashboardProps {
  userId: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    email_enabled: true,
    in_app_enabled: true,
    frequency: 'immediate',
    quiet_hours_start: '',
    quiet_hours_end: '',
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchGroups();
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [userId]);

  const setupWebSocket = () => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event: MessageEvent) => {
      const newNotification: Notification = JSON.parse(event.data);
      setNotifications((prev) => [newNotification, ...prev]);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(setupWebSocket, 5000);
    };

    websocket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection failed');
    };

    setWs(websocket);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Notification[]>(`http://localhost:8000/notifications/${userId}`);
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get<Group[]>('http://localhost:8000/notification-groups/');
      setGroups(response.data);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    }
  };

  const updateNotificationStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`http://localhost:8000/notifications/${id}`, { status });
      fetchNotifications();
    } catch (err) {
      setError('Failed to update notification');
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      setError('Failed to delete notification');
      console.error(err);
    }
  };

  const handlePreferenceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPreferences((prev) => ({ ...prev, [name]: checked }));
    } else {
      setPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container  p-4">

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border rounded-lg shadow-md bg-white">
                <h3 className="text-lg font-semibold">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <p className="text-gray-600">Type: {notification.type}</p>
                <p className="text-gray-600">
                  Created: {new Date(notification.created_at).toLocaleString()}
                </p>
                <div className="mt-2 flex space-x-2">
                  <select
                    value={notification.status}
                    onChange={(e) => updateNotificationStatus(notification.id, e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="px-4 py-2 bg-black text-white rounded "
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
        <form onSubmit={handlePreferenceSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <select
            name="selectedGroup"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email_enabled"
              name="email_enabled"
              checked={preferences.email_enabled}
              onChange={handlePreferenceChange}
              className="p-2 border rounded"
            />
            <label htmlFor="email_enabled">Enable Email Notifications</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="in_app_enabled"
              name="in_app_enabled"
              checked={preferences.in_app_enabled}
              onChange={handlePreferenceChange}
              className="p-2 border rounded"
            />
            <label htmlFor="in_app_enabled">Enable In-App Notifications</label>
          </div>
          <select
            name="frequency"
            value={preferences.frequency}
            onChange={handlePreferenceChange}
            className="w-full p-2 border rounded"
          >
            <option value="immediate">Immediate</option>
            <option value="daily">Daily Digest</option>
            <option value="weekly">Weekly Digest</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              name="quiet_hours_start"
              value={preferences.quiet_hours_start}
              onChange={handlePreferenceChange}
              className="p-2 border rounded"
              placeholder="Quiet Hours Start"
            />
            <input
              type="time"
              name="quiet_hours_end"
              value={preferences.quiet_hours_end}
              onChange={handlePreferenceChange}
              className="p-2 border rounded"
              placeholder="Quiet Hours End"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-blue-600"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;