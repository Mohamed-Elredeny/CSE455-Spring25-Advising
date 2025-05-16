import React from 'react';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  type: 'in' | 'out';
  fileUrl?: string;
  fileName?: string;
  deleted?: boolean;
  edited?: boolean;
}

interface MessageProps {
  message: Message;
  userName: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  userName,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  onEditContentChange,
  onEditSubmit,
  onEditCancel
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

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading file:', error));
  };

  const canEditOrDelete = () => {
    const messageDate = new Date(message.createdAt);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    return messageDate > threeHoursAgo;
  };

  return (
    <div
      id={`message-${message._id}`}
      className={`d-flex mb-4 ${message.type === 'out' ? 'justify-content-end' : ''}`}
    >
      <div className={`d-flex flex-column align-items-${message.type === 'out' ? 'end' : 'start'} mb-2`}>
        {isEditing && !message.deleted ? (
          <div className="d-flex flex-column align-items-end bg-light-info rounded p-5">
            <input
              type="text"
              className="form-control form-control-flush mb-2"
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              autoFocus
            />
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-info" onClick={onEditSubmit}>Save</button>
              <button className="btn btn-sm btn-light-info" onClick={onEditCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="d-flex">
            {message.type === 'in' && (
              <div className="symbol symbol-35px symbol-circle me-3">
                <span className="symbol-label bg-light-info text-info fw-bolder">
                  {userName.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center">
                <div className={`d-flex flex-column ${message.type === 'out' ? 'align-items-end' : ''}`}>
                  {message.type === 'in' && (
                    <div className="text-muted fs-8 mb-1">{userName}</div>
                  )}
                  <div className="position-relative message-container">
                    <div 
                      className={`rounded px-4 py-2 ${
                        message.deleted ? 'bg-light-info' : 
                        message.type === 'out' ? 'bg-info cursor-pointer' : 'bg-light-secondary'
                      }`}
                      onDoubleClick={() => {
                        if (message.type === 'out' && !message.deleted && canEditOrDelete()) {
                          onEdit(message._id, message.content);
                        }
                      }}
                    >
                      {message.deleted ? (
                        <div className="text-muted fst-italic fs-7">Message has been deleted</div>
                      ) : (
                        <div className={`${message.type === 'out' ? 'text-white' : 'text-gray-800'} fw-semibold fs-7`}>
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`d-flex align-items-center gap-2 mt-1 ${message.type === 'out' ? 'justify-content-end' : ''}`}>
                    <span className="text-muted fs-8">{formatDate(message.createdAt)}</span>
                    {message.edited && !message.deleted && (
                      <span className="text-info fs-8 fst-italic ms-1">(edited)</span>
                    )}
                    {message.type === 'out' && !message.deleted && canEditOrDelete() && (
                      <button
                        className="btn btn-sm btn-icon btn-active-light-info p-0 h-20px w-20px"
                        onClick={() => onDelete(message._id)}
                      >
                        <i className="ki-duotone ki-trash fs-7 text-info">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                    )}
                  </div>

                  {message.fileUrl && !message.deleted && (
                    <div className="mt-2">
                      <a 
                        href={message.fileUrl} 
                        className={`btn btn-sm ${message.type === 'out' ? 'btn-light-info' : 'btn-light-info'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (message.fileUrl && message.fileName) {
                            handleFileDownload(message.fileUrl, message.fileName);
                          }
                        }}
                      >
                        <i className="ki-duotone ki-document fs-2 me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        {message.fileName || 'Download File'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Remove the hover styles since we're showing the delete button inline
const style = document.createElement('style');
style.textContent = `
  .message-container {
    position: relative;
  }
`;
document.head.appendChild(style);

export default Message;