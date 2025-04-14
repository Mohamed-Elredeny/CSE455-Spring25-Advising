import NotificationList from '../../components/team3/notification/NotificationList';
import NotificationForm from '../../components/team3/notification/NotificationForm';
import NotificationGroupForm from '../../components/team3/notification/NotificationGroupForm';
import NotificationPreferences from '../../components/team3/notification/NotificationPreferences';

function NotificationTestUI() {
    const [view, setView] = useState('notifications');
    const userId = 'student123';
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Notification Center</h1>
        
        <div className="mb-4 space-x-2">
          <button
            className={`px-4 py-2 ${view === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('notifications')}
          >
            View Notifications
          </button>
          <button
            className={`px-4 py-2 ${view === 'crud' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('crud')}
          >
            Create Notification
          </button>
          <button
            className={`px-4 py-2 ${view === 'groups' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('groups')}
          >
            Manage Groups
          </button>
          <button
            className={`px-4 py-2 ${view === 'preferences' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('preferences')}
          >
            Preferences
          </button>
        </div>
  
        {view === 'notifications' && <NotificationList userId={userId} />}
        {view === 'crud' && <NotificationForm userId={userId} onNotificationCreated={() => window.location.reload()} />}
        {view === 'groups' && <NotificationGroupForm onGroupCreated={() => window.location.reload()} />}
        {view === 'preferences' && <NotificationPreferences userId={userId} />}
      </div>
    );
  }
  
  export default NotificationTestUI;