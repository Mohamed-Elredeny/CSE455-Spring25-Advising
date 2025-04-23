import React, { useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  newMessage: string;
  onMessageChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
  onSend: (e: React.FormEvent) => void;
  selectedFile: File | null;
  isUploading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  onMessageChange,
  onFileSelect,
  onSend,
  selectedFile,
  isUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please upload an image, PDF, or text file.');
        return;
      }
      onFileSelect(file);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      onSend(e);
    }
  };

  return (
    <div className="card-footer p-0">
      {selectedFile && (
        <div className="px-4 py-3 bg-light-info border-top">
          <div className="d-flex align-items-center">
            <i className="bi bi-file-earmark fs-2 text-info me-2"></i>
            <div className="flex-grow-1">
              <div className="fw-bold text-gray-900">{selectedFile.name}</div>
              <div className="text-muted fs-7">{Math.round(selectedFile.size / 1024)} KB</div>
            </div>
            <button
              type="button"
              className="btn btn-icon btn-sm btn-active-light-info ms-3"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
            >
              <i className="bi bi-x fs-2"></i>
            </button>
          </div>
        </div>
      )}
      
      <div className="d-flex align-items-center px-4 py-3">
        <button
          type="button"
          className="btn btn-icon bi bi-paperclip fs-2 text-info"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
        />
        <input
          type="text"
          className="form-control form-control-flush me-3"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isUploading}
        />

        <button
          type="submit"
          className="btn btn-light-info"
          onClick={onSend}
          disabled={(!newMessage.trim() && !selectedFile) || isUploading}
        >
          {isUploading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <>
              <i className="bi bi-send-fill fs-2 me-2"></i>
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 