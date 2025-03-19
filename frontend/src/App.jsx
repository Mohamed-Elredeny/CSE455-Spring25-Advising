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