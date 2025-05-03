import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationForm {
  user_id: string;
  group_id: string;
  type: string;
  title: string;
  message: string;
  metadata: string;
}

interface GroupForm {
  name: string;
  description: string;
  college_id: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  members: string[];
}

const AdminDashboard: React.FC = () => {
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    user_id: '',
    group_id: '',
    type: '',
    title: '',
    message: '',
    metadata: '',
  });
  const [groupForm, setGroupForm] = useState<GroupForm>({
    name: '',
    description: '',
    college_id: '',
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get<Group[]>('http://localhost:8000/notification-groups/');
      setGroups(response.data);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    }
  };

  const handleNotificationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: notificationForm.user_id || null,
        group_id: notificationForm.group_id || null,
        title: notificationForm.title,
        type: notificationForm.type,
        message: notificationForm.message,
        metadata: notificationForm.metadata ? JSON.parse(notificationForm.metadata) : null,
      };
      await axios.post('http://localhost:8000/notifications/', payload);
      setNotificationForm({ user_id: '', group_id: '', type: '', title: '', message: '', metadata: '' });
      setError(null);
    } catch (err) {
      setError('Failed to create notification');
      console.error(err);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const groupResponse = await axios.post<{ id: string }>('http://localhost:8000/notification-groups/', {
        name: groupForm.name,
        description: groupForm.description,
      });

      if (groupForm.college_id) {
        await axios.post('http://localhost:8000/notification-groups/members/', {
          college_id: groupForm.college_id,
          group_id: groupResponse.data.id,
        });
      }

      setGroupForm({ name: '', description: '', college_id: '' });
      fetchGroups();
      setError(null);
    } catch (err) {
      setError('Failed to create group or add member');
      console.error(err);
    }
  };

  return (
    <div className=" w-full p-4">

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Send Notification</h2>
        <form onSubmit={handleNotificationSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <input
            name="user_id"
            value={notificationForm.user_id}
            onChange={handleNotificationChange}
            placeholder="User ID (optional)"
            className="w-full p-2 border rounded my-2"
          />
          <br />
          <select
          title='Select Group (optional)'
            name="group_id"
            value={notificationForm.group_id}
            onChange={handleNotificationChange}
            className="w-full p-2 border rounded"
          >
            <option value="" >Select Group (optional)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <br />
          <input
            name="type"
            value={notificationForm.type}
            onChange={handleNotificationChange}
            placeholder="Notification Type"
            className="w-full p-2 border my-2 rounded"
            required
          />
          <br />
          <input
            name="title"
            value={notificationForm.title}
            onChange={handleNotificationChange}
            placeholder="Title"
            className="w-full p-2  my-2 border rounded"
            required
          />
          <br />
          <textarea
            name="message"
            value={notificationForm.message}
            onChange={handleNotificationChange}
            placeholder="Message"
            className="w-full p-2 border my-2 rounded"
            required
          />
          <br />
          <input
            name="metadata"
            value={notificationForm.metadata}
            onChange={handleNotificationChange}
            placeholder='Metadata as JSON (e.g., {"session_id": "123"})'
            className="w-full p-2 border rounded"
          />
          <br />
          <button
            type="submit"
            className="px-4 py-2 bg-black ring-1  mt-3 text-white rounded hover:bg-blue-600"
          >
            Send Notification
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Create Group</h2>
        <form onSubmit={handleGroupSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <input
            name="name"
            value={groupForm.name}
            onChange={handleGroupChange}
            placeholder="Group Name"
            className="w-full my-2  p-2 border rounded"
            required
          />
          <br />
          <textarea
            name="description"
            value={groupForm.description}
            onChange={handleGroupChange}
            placeholder="Description"
            className="w-full my-2 p-2 border rounded"
          />
          <br />
          <input
            name="college_id"
            value={groupForm.college_id}
            onChange={handleGroupChange}
            placeholder="College ID (optional)"
            className="w-full p-2 border rounded"
          />
          <br />
          <button
            type="submit"
            className="px-4 my-2 py-2 bg-black text-white rounded hover:bg-blue-600"
          > 
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;