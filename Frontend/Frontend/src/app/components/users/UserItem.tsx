import React from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface UserItemProps {
  user: User;
  onClick: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onClick }) => {
  return (
    <div className="px-5 py-4 hover-scale-102 mb-1">
      <div
        onClick={onClick}
        className="bg-hover-light-primary rounded-3 p-3 d-flex align-items-center cursor-pointer"
      >
        <div className="symbol symbol-50px symbol-circle me-5 position-relative">
          <span className="symbol-label bg-light-info text-info fw-bolder">
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>

        <div className="d-flex flex-column flex-grow-1">
          <span className="fs-5 text-gray-900 mb-1">{user.name}</span>
          <span className="fs-7 text-gray-500">{user.email}</span>
        </div>

        <div className="d-flex flex-column align-items-end ms-2">
          {user.unreadCount && user.unreadCount > 0 && (
            <span className="badge badge-circle badge-info">{user.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserItem; 