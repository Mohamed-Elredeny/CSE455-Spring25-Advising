import React, { useEffect, useRef, useCallback } from 'react';
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
  edited?: boolean;
  senderName?: string; // for group chat
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
  isGroupChat?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  userName,
  onEdit,
  onDelete,
  editingMessageId,
  editContent,
  onEditContentChange,
  onEditSubmit,
  onEditCancel,
  isGroupChat = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // For group chat, display 'me' for current user, otherwise senderName or userName
  const getDisplayName = (message: Message) => {
    if (isGroupChat && message.senderId === currentUserId) return 'me';
    if (isGroupChat && message.senderName) return message.senderName;
    return userName;
  };

  return (
    <div className="messages">
      {messages.map((message) => (
        <MessageComponent
          key={message._id}
          message={message}
          userName={getDisplayName(message)}
          onEdit={onEdit}
          onDelete={onDelete}
          isEditing={editingMessageId === message._id}
          editContent={editContent}
          onEditContentChange={onEditContentChange}
          onEditSubmit={onEditSubmit}
          onEditCancel={onEditCancel}
          isGroupChat={isGroupChat}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 