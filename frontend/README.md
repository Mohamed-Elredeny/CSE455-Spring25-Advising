Let’s create detailed documentation for the frontend of your Notification Manager application, which is built using **React**, **Vite**, and **Tailwind CSS**. This documentation will serve as a guide for developers to understand, set up, and use the frontend, as well as provide insights into its structure, components, and interaction with the FastAPI backend.

---

### Frontend Documentation for Notification Manager

#### 1. Introduction
The Notification Manager frontend is a web application built with **React**, **Vite**, and **Tailwind CSS**. It provides a user-friendly interface for managing notifications in an advising application. Users can create, view, update, and delete notifications, interacting with a FastAPI backend that stores data in MongoDB Atlas.

#### 2. Features
- **View Notifications**: Display a list of notifications for a specific user.
- **Create Notifications**: Add new notifications with customizable type, message, and metadata.
- **Update Notification Status**: Mark notifications as "unread," "read," or "dismissed."
- **Delete Notifications**: Remove notifications from the system.
- **Responsive Design**: Styled with Tailwind CSS for a responsive and modern UI.

#### 3. Tech Stack
- **Framework**: React (v18.x)
- **Build Tool**: Vite (v5.x)
- **Styling**: Tailwind CSS (v3.4.x)
- **HTTP Client**: Axios (v1.x)
- **Package Manager**: npm (v10.x)

#### 4. Project Structure
The frontend is located in the `frontend` directory (e.g., `C:\Users\ASUS\Desktop\College\CSE455-Spring25-Advising\frontend`). Here’s the structure:

```
frontend/
  ├── node_modules/               # Dependencies
  ├── public/                    # Static assets
  │   ├── vite.svg
  │   └── favicon.ico
  ├── src/                       # Source code
  │   ├── components/            # React components
  │   │   ├── NotificationList.jsx
  │   │   ├── NotificationForm.jsx
  │   │   └── NotificationItem.jsx
  │   ├── App.jsx                # Main app component
  │   ├── index.css              # Tailwind CSS imports
  │   ├── main.jsx               # Entry point for React
  │   └── App.css                # Optional custom CSS (if needed)
  ├── .gitignore                 # Git ignore file
  ├── package.json               # Dependencies and scripts
  ├── vite.config.js             # Vite configuration
  ├── tailwind.config.js         # Tailwind CSS configuration
  ├── postcss.config.js          # PostCSS configuration
  ├── index.html                 # HTML entry point
  └── README.md                  # Project documentation (this file)
```

#### 5. Setup Instructions
##### 5.1 Prerequisites
- **Node.js**: Version 18.x or higher (v21.7.2 recommended as of March 2025).
- **npm**: Version 10.x or higher (comes with Node.js).
- **Backend**: The FastAPI backend must be running at `http://127.0.0.1:8000` (see backend documentation for setup).

##### 5.2 Installation
1. **Navigate to the Frontend Directory**:
   ```bash
   cd C:\Users\ASUS\Desktop\College\CSE455-Spring25-Advising\frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   - This installs React, Vite, Tailwind CSS, Axios, and other dependencies listed in `package.json`.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - This starts the Vite development server at `http://localhost:5173`.

4. **Verify the Application**:
   - Open `http://localhost:5173` in your browser.
   - You should see the Notification Center interface with a form to create notifications and a list of notifications for the user `student123`.

##### 5.3 Build for Production
1. **Build the Application**:
   ```bash
   npm run build
   ```
   - This generates optimized static assets in the `dist/` directory.

2. **Preview the Build**:
   ```bash
   npm run preview
   ```
   - This serves the production build locally to test it.

#### 6. Configuration
##### 6.1 Tailwind CSS Configuration
- **File**: `tailwind.config.js`
- **Content**:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```
- **Purpose**: Specifies the paths where Tailwind CSS should look for classes to include in the final CSS build.

##### 6.2 Vite Configuration
- **File**: `vite.config.js`
- **Content** (includes proxy for CORS during development):
  ```javascript
  export default {
    server: {
      proxy: {
        '/notifications': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
  ```
- **Purpose**: Proxies API requests to the FastAPI backend to bypass CORS issues during development. In production, ensure the backend has proper CORS configuration.

#### 7. Components
##### 7.1 `App.jsx`
- **Purpose**: The main component that renders the Notification Center.
- **Code**:
  ```jsx
  import React from 'react';
  import NotificationList from './components/NotificationList';
  import NotificationForm from './components/NotificationForm';
  import './App.css'; // Optional custom CSS if needed

  function App() {
    const userId = 'student123'; // Hardcoded for now; replace with dynamic user ID later

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Notification Center</h1>
        <NotificationForm userId={userId} onNotificationCreated={() => window.location.reload()} />
        <NotificationList userId={userId} />
      </div>
    );
  }

  export default App;
  ```
- **Notes**:
  - Hardcodes `userId` as `student123`. In a production app, this should be dynamically fetched via authentication.
  - Uses Tailwind CSS classes for styling (e.g., `container`, `mx-auto`, `p-4`).

##### 7.2 `NotificationList.jsx`
- **Purpose**: Displays a list of notifications for a user and handles fetching, updating, and deleting.
- **Code**:
  ```jsx
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
        const response = await axios.get(`/notifications/${userId}`); // Proxied to backend
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
        await axios.patch(`/notifications/${id}`, { status });
        fetchNotifications(); // Refresh the list
      } catch (err) {
        setError('Failed to update notification');
        console.error(err);
      }
    };

    const deleteNotification = async (id) => {
      try {
        await axios.delete(`/notifications/${id}`);
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
  ```
- **Notes**:
  - Uses Axios to make API requests to the backend.
  - Implements a proxy in `vite.config.js` to handle CORS during development.
  - Refreshes the list after updating or deleting a notification.

##### 7.3 `NotificationForm.jsx`
- **Purpose**: Provides a form to create new notifications.
- **Code**:
  ```jsx
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
        await axios.post('/notifications/', payload);
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
  ```
- **Notes**:
  - Allows users to specify the notification type, message, and optional metadata.
  - Submits the form data to the backend via a `POST` request.
  - Clears the form and triggers a refresh after successful creation.

##### 7.4 `NotificationItem.jsx`
- **Purpose**: Renders a single notification with options to update its status or delete it.
- **Code**:
  ```jsx
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
  ```
- **Notes**:
  - Displays notification details (message, type, creation date, status).
  - Provides a dropdown to update the status and a button to delete the notification.

#### 8. API Integration
The frontend interacts with the FastAPI backend via the following endpoints:
- **Create Notification**: `POST /notifications/`
- **Get Notifications**: `GET /notifications/{user_id}`
- **Get Notifications by Type**: `GET /notifications/{user_id}/type/{notification_type}`
- **Update Notification**: `PATCH /notifications/{notification_id}`
- **Delete Notification**: `DELETE /notifications/{notification_id}`

- **Base URL**: `http://127.0.0.1:8000` (proxied via Vite during development).
- **Proxy Configuration**: Requests to `/notifications/*` are proxied to the backend to avoid CORS issues in development.

#### 9. Styling
- **Tailwind CSS**: Used for styling the UI with utility classes.
- **Customization**: You can extend the Tailwind theme in `tailwind.config.js` to add custom colors, fonts, or spacing.

#### 10. Error Handling
- **Network Errors**: Displayed as "Failed to fetch notifications" or similar messages when API requests fail.
- **Form Validation**: Basic validation (e.g., required fields) is handled via HTML attributes (`required`).
- **Improvements**: Add more robust error handling (e.g., toast notifications) and client-side validation.

#### 11. Testing
##### 11.1 Manual Testing
1. **Start the Backend**:
   ```bash
   cd C:\Users\ASUS\Desktop\College\CSE455-Spring25-Advising\backend
   .\venv\Scripts\activate
   uvicorn main:app --reload
   ```

2. **Start the Frontend**:
   ```bash
   cd C:\Users\ASUS\Desktop\College\CSE455-Spring25-Advising\frontend
   npm run dev
   ```

3. **Test Features**:
   - Create a notification and verify it appears in the list.
   - Update a notification’s status and confirm the change.
   - Delete a notification and ensure it’s removed.
   - Check responsiveness on different screen sizes.

##### 11.2 Automated Testing (Future)
- Add unit tests with **Jest** and **React Testing Library**.
- Example test for `NotificationItem`:
  ```javascript
  import { render, screen, fireEvent } from '@testing-library/react';
  import NotificationItem from './components/NotificationItem';

  test('renders notification and handles status change', () => {
    const notification = {
      id: '1',
      message: 'Test notification',
      type: 'reminder',
      status: 'unread',
      created_at: '2025-03-16T12:34:56.789Z',
    };
    const onUpdate = jest.fn();
    const onDelete = jest.fn();

    render(<NotificationItem notification={notification} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText('Test notification')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'read' } });
    expect(onUpdate).toHaveBeenCalledWith('1', 'read');
  });
  ```

#### 12. Deployment
1. **Build the Frontend**:
   ```bash
   npm run build
   ```
   - Outputs static files to the `dist/` directory.

2. **Deploy to Vercel**:
   - Install the Vercel CLI:
     ```bash
     npm install -g vercel
     ```
   - Deploy:
     ```bash
     vercel deploy
     ```
   - Follow the prompts to deploy the app.

3. **Configure Backend CORS**:
   - Update the backend’s CORS `allow_origins` to include the production frontend URL (e.g., `https://your-app.vercel.app`).

#### 13. Future Improvements
- **Real-Time Updates**: Use WebSockets (e.g., via `socket.io`) to update the notification list in real-time.
- **Pagination**: Add pagination to handle large numbers of notifications.
- **Enhanced Styling**: Add animations and improve the UI/UX with Tailwind CSS.
- **Error Handling**: Implement toast notifications (e.g., using `react-toastify`) for better user feedback.

#### 14. Troubleshooting
- **CORS Issues**:
  - Ensure the backend has CORS configured to allow the frontend origin (`http://localhost:5173` in development, or the production URL).
  - Use the Vite proxy as a fallback during development.
- **Network Errors**:
  - Verify the backend is running at `http://127.0.0.1:8000`.
  - Check the browser’s Network tab for failed requests and inspect the response.
- **Styling Issues**:
  - Ensure Tailwind CSS is properly set up (`tailwind.config.js`, `index.css`).
  - Run `npm run dev` to rebuild styles if changes don’t reflect.

#### 15. Contact
For support or contributions, contact the development team at `abdelrahman.noaman@holistic-intelligence.net`.

---

