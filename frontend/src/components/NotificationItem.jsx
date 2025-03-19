import React from 'react';

const NotificationItem = ({ notification, onUpdate, onDelete }) => {
  const handleStatusChange = (e) => {
    onUpdate(notification.id, e.target.value);
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  return (
    <div className="p-4 mb-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold">{notification.message}</h3>
      <p className="text-gray-600">Type: {notification.type}</p>
      <p className="text-gray-600">Created: {new Date(notification.created_at).toLocaleString()}</p>
      <select
        value={notification.status}
        onChange={handleStatusChange}
        className="mt-2 p-2 border rounded"
      >
        <option value="unread">Unread</option>
        <option value="read">Read</option>
        <option value="dismissed">Dismissed</option>
      </select>
      <button
        onClick={handleDelete}
        className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};

export default NotificationItem;