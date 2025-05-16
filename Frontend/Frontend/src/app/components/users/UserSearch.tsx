import React from 'react';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="position-relative mb-5 w-100">
      <input
        type="text"
        className="form-control form-control-solid px-15 w-100 user-search-input"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <span className="position-absolute top-50 end-0 translate-middle-y me-5">
        <span className="svg-icon svg-icon-muted svg-icon-2hx">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21.7 18.9L18.6 15.8C17.9 16.9 16.9 17.9 15.8 18.6L18.9 21.7C19.3 22.1 19.9 22.1 20.3 21.7L21.7 20.3C22.1 19.9 22.1 19.3 21.7 18.9Z" fill="currentColor"/>
            <path opacity="0.3" d="M11 20C6 20 2 16 2 11C2 6 6 2 11 2C16 2 20 6 20 11C20 16 16 20 11 20ZM11 4C7.1 4 4 7.1 4 11C4 14.9 7.1 18 11 18C14.9 18 18 14.9 18 11C18 7.1 14.9 4 11 4Z" fill="currentColor"/>
          </svg>
        </span>
      </span>
    </div>
  );
};

export default UserSearch;

// Add style for smaller font
const style = document.createElement('style');
style.textContent = `
  .user-search-input {
    font-size: 0.9rem;
  }
`;
document.head.appendChild(style); 