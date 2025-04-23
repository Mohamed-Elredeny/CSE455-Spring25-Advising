import React, { useEffect, useRef } from 'react';
import MessageComponent from './Message';

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
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  userName: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  editingMessageId: string | null;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  userName,
  onEdit,
  onDelete,
  editingMessageId,
  editContent,
  onEditContentChange,
  onEditSubmit,
  onEditCancel
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages">
      {messages.map((message) => (
        <MessageComponent
          key={message._id}
          message={message}
          userName={userName}
          onEdit={onEdit}
          onDelete={onDelete}
          isEditing={editingMessageId === message._id}
          editContent={editContent}
          onEditContentChange={onEditContentChange}
          onEditSubmit={onEditSubmit}
          onEditCancel={onEditCancel}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 