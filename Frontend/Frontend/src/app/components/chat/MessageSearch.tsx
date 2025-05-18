import React from 'react';

interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  searchResults: Message[];
  onResultClick: (messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
  searchResults,
  onResultClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="card-header" style={{ position: 'relative' }}>
      <div className="card-title">
        <div className="d-flex align-items-center position-relative">
          <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-4">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <input
            type="text"
            className="form-control form-control-solid w-250px ps-12"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            className="btn btn-icon btn-active-light-primary ms-2"
            onClick={onClose}
          >
            <i className="ki-duotone ki-cross fs-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        </div>
      </div>
      {searchResults.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '48px', // just below the search bar
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: '200px',
            overflowY: 'auto',
            borderRadius: '8px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            margin: '0 8px',
            padding: '8px 0',
            border: '1px solid #eee'
          }}
        >
          {searchResults.map((result) => (
            <div
              key={result._id}
              className="d-flex flex-column mb-5 cursor-pointer hover-elevate-up px-6"
              onClick={() => {
                onResultClick(result._id);
                onClose();
              }}
            >
              <div className="text-dark fw-semibold fs-6">{result.content}</div>
              <div className="text-muted fs-7">{formatDate(result.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageSearch; 