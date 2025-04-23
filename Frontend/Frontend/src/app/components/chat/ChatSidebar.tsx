import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../users/UserList';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface ChatSidebarProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ users, onUserSelect }) => {
  const navigate = useNavigate();

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="chat-sidebar">
      <div className="card h-100">
        <div className="card-header">
          <div className="card-title">
            <h3 className="card-label">Chats</h3>
          </div>
        </div>
        <div className="card-body">
          <UserList
            users={users}
            onUserSelect={handleUserSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 