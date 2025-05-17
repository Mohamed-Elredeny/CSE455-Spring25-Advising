import React from 'react';

interface GroupChatInputProps {
  newMessage: string;
  onMessageChange: (msg: string) => void;
  onFileSelect: (file: File | null) => void;
  onSend: (e: React.FormEvent) => void;
  selectedFile: File | null;
  isUploading: boolean;
}

const GroupChatInput: React.FC<GroupChatInputProps> = ({
  newMessage,
  onMessageChange,
  onFileSelect,
  onSend,
  selectedFile,
  isUploading,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    } else {
      onFileSelect(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(e as any);
    }
  };

  return (
    <div className="card-footer pt-4" id="kt_chat_messenger_footer">
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
          className="d-none"
          onChange={handleFileSelect}
          accept={'.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp3,.mp4,.avi,.mov,.csv'}
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

export default GroupChatInput; 