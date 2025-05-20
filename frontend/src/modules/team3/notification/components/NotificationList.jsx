import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationItem from './NotificationItem';

const NotificationList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/notifications/${userId}`);
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateNotification = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/notifications/${id}`, { status });
      fetchNotifications(); // Refresh the list
    } catch (err) {
      setError('Failed to update notification');
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/notifications/${id}`);
      fetchNotifications(); // Refresh the list
    } catch (err) {
      setError('Failed to delete notification');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onUpdate={updateNotification}
            onDelete={deleteNotification}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;