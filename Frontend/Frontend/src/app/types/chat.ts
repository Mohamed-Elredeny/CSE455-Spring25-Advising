export interface Message {
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

export interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export interface Group {
  _id: string;
  name: string;
  members: string[];
}

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

export interface GroupDetails extends Group {
  admins: string[];
  members: User[];
  createdBy: string;
}

export interface GroupMetadataUpdate {
  groupId: string;
  type: 'members' | 'admins' | 'name' | 'deleted';
  data: {
    members?: string[];
    admins?: string[];
    name?: string;
    deleted?: boolean;
  };
} 