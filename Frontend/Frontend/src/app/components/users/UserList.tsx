import React, { useState } from 'react';
import UserSearch from './UserSearch';
import UserItem from './UserItem';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card card-flush">
      <div className="card-header pt-7">
        <UserSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      <div className="card-body pt-5">
        {filteredUsers.map(user => (
          <UserItem
            key={user._id}
            user={user}
            onClick={() => onUserSelect(user)}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList; 