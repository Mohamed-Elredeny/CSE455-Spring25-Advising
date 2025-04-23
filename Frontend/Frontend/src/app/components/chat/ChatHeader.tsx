import React from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
}

interface ChatHeaderProps {
  chatUser: User | null;
  isOnline: boolean;
  onSearchClick: () => void;
  onCloseClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatUser,
  isOnline,
  onSearchClick,
  onCloseClick
}) => {

  const getInitials = (username?: string) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  if (!chatUser) {
    return (
      <div className="chat-header">
        <div className="d-flex justify-content-between align-items-center h-100">
          <div className="text-muted">Select a chat to start messaging</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-header">
      <div className="d-flex justify-content-between align-items-center h-100">
        <div className="d-flex align-items-center">
          <div className="symbol symbol-35px symbol-circle me-3">
            <span className="symbol-label bg-light-info text-info">
              {getInitials(chatUser.name)}
            </span>
          </div>
          <div>
            <h3 className="fs-4 text-dark mb-0">{chatUser.name}</h3>
            <div className="d-flex align-items-center">
              <span className={`badge badge-circle w-10px h-10px me-1 ${isOnline ? 'bg-success' : 'bg-secondary'}`}></span>
              <span className="fs-7 text-muted">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="position-relative">
          <button
            className="btn btn-icon btn-active-light-info me-2"
            onClick={onSearchClick}
          >
            <i className="ki-duotone ki-magnifier fs-4">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
          <button
            className="btn btn-icon btn-active-light-info"
            onClick={onCloseClick}
          >
            <i className="ki-duotone ki-cross-square fs-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 