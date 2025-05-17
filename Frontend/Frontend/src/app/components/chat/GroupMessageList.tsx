import React from 'react';
import MessageList from './MessageList';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
  type: 'in' | 'out';
  fileUrl?: string;
  fileName?: string;
  deleted?: boolean;
  edited?: boolean;
}

interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  members: string[];
}

interface GroupMessageListProps {
  groupMessages: Message[];
  groupDetails: any;
  selectedGroup: Group;
  currentUserId: string;
  editingMessageId: string | null;
  editMessageContent: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onEditContentChange: (content: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
}

const GroupMessageList: React.FC<GroupMessageListProps> = ({
  groupMessages,
  groupDetails,
  selectedGroup,
  currentUserId,
  editingMessageId,
  editMessageContent,
  onEdit,
  onDelete,
  onEditContentChange,
  onEditSubmit,
  onEditCancel,
}) => (
  <MessageList
    messages={groupMessages.map(msg => ({
      ...msg,
      senderName:
        groupDetails && typeof msg.senderId === 'string'
          ? ((groupDetails.members.find((m: GroupMember | string) => typeof m === 'object' && m._id === msg.senderId) as GroupMember | undefined)?.name || selectedGroup.name)
          : selectedGroup.name
    }))}
    currentUserId={currentUserId}
    userName={selectedGroup.name}
    onEdit={onEdit}
    onDelete={onDelete}
    editingMessageId={editingMessageId}
    editContent={editMessageContent}
    onEditContentChange={onEditContentChange}
    onEditSubmit={onEditSubmit}
    onEditCancel={onEditCancel}
    isGroupChat={true}
  />
);

export default GroupMessageList; 