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
  shouldNavigate?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ users, onUserSelect, shouldNavigate = true }) => {
  const navigate = useNavigate();

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    if (shouldNavigate) {
      navigate(`/chat/${user._id}`);
    }
  };

  return (
    <div className="chat-sidebar" style={{ paddingLeft: 16, paddingRight: 16 }}>
      <h3 className="card-label mb-4">Chats</h3>
      <UserList
        users={users}
        onUserSelect={handleUserSelect}
      />
    </div>
  );
};

export default ChatSidebar; 