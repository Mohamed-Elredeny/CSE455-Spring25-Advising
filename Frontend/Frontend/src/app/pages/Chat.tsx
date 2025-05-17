import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/core/Auth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import './Chat.css';

import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import MessageSearch from '../components/chat/MessageSearch';
import ChatHeader from '../components/chat/ChatHeader';
import ChatSidebar from '../components/chat/ChatSidebar';
import GroupChatHeader from '../components/chat/GroupChatHeader';
import GroupMessageList from '../components/chat/GroupMessageList';
import GroupChatInput from '../components/chat/GroupChatInput';
import GroupModals from '../components/chat/GroupModals';

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

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface Group {
  _id: string;
  name: string;
  members: string[];
}

interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userListError, setUserListError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [groupListError, setGroupListError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [groupDetails, setGroupDetails] = useState<Group & { admins: string[]; members: User[]; createdBy: string } | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [selectedAddMembers, setSelectedAddMembers] = useState<string[]>([]);
  const [selectedRemoveMembers, setSelectedRemoveMembers] = useState<string[]>([]);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [renameGroupName, setRenameGroupName] = useState('');

  // Only show user list if on /chat/private
  const isPrivateChatList = location.pathname === '/chat/private';

  // Fetch chat user and messages only if not in /chat/private (legacy route)
  useEffect(() => {
    if (!isPrivateChatList && userId && auth?.token) {
    const fetchChatUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        if (response.data && response.data._id) {
          setChatUser(response.data);
        } else {
            setChatUser(null);
        }
      } catch (error) {
          setChatUser(null);
      }
    };
      fetchChatUser();
    }
  }, [userId, auth?.token, isPrivateChatList]);

  useEffect(() => {
    if (!isPrivateChatList && userId && auth?.token && auth?.user?._id) {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/messages?userId=${userId}&currentUserId=${auth.user._id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          setMessages(response.data);
        }
      } catch (error) {
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [userId, auth?.token, auth?.user?._id, isPrivateChatList]);

  // Fetch messages for selectedUser in /chat/private
  useEffect(() => {
    if (isPrivateChatList && selectedUser && auth?.token && auth?.user?._id) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/messages?userId=${selectedUser._id}&currentUserId=${auth.user._id}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
        if (Array.isArray(response.data)) {
          setMessages(response.data);
        }
      } catch (error) {
          setMessages([]);
      }
    };
    fetchMessages();
      setChatUser(selectedUser);
    }
  }, [isPrivateChatList, selectedUser, auth?.token, auth?.user?._id]);

  useEffect(() => {
    if (!auth?.token) return;

    const socketInstance: Socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: { token: auth?.token }
    });
    
    socketInstance.on('connect', () => {
      socketInstance.emit('getOnlineUsers');
    });

    socketInstance.on('onlineUsers', (onlineUsers: string[]) => {
      setOnlineUsers(onlineUsers);
      setUsers(prevUsers =>
        prevUsers.map(user => ({
          ...user,
          isOnline: onlineUsers.includes(user._id)
        }))
      );
      if (chatUser) {
        setIsOnline(onlineUsers.includes(chatUser._id));
      }
    });

    socketInstance.on('userOnline', (data: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId ? { ...user, isOnline: true } : user
        )
      );
      if (chatUser && data.userId === chatUser._id) {
        setIsOnline(true);
      }
    });

    socketInstance.on('userOffline', (data: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId ? { ...user, isOnline: false } : user
        )
      );
      if (chatUser && data.userId === chatUser._id) {
        setIsOnline(false);
      }
    });

    socketInstance.on('message', (data) => {
      const targetUserId = isPrivateChatList ? selectedUser?._id : userId;
      if (data.senderId === targetUserId || data.receiverId === targetUserId) {
        const messageType = data.senderId === auth?.user?._id ? 'out' : 'in';
        const newMessage = { ...data, type: messageType };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    socketInstance.on('messageUpdate', ({ messageId, content, edited, receiverId }) => {
      const targetUserId = isPrivateChatList ? selectedUser?._id : userId;
      if (receiverId === auth?.user?._id || receiverId === targetUserId) {
      setMessages(prev =>
        prev.map(msg =>
            msg._id === messageId ? { ...msg, content, edited: !!edited } : msg
        )
      );
      }
    });

    socketInstance.on('messageDelete', ({ messageId, receiverId }) => {
      const targetUserId = isPrivateChatList ? selectedUser?._id : userId;
      if (receiverId === auth?.user?._id || receiverId === targetUserId) {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, deleted: true } : msg
      ));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [auth?.token, chatUser, userId, auth?.user?._id, isPrivateChatList, selectedUser?._id]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${auth?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data && response.data.fileUrl) {
        return response.data.fileUrl;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = isPrivateChatList ? selectedUser?._id : userId;
    if ((!newMessage.trim() && !selectedFile) || !socket || !targetUserId || !auth?.user?._id) return;

    try {
      let fileUrl = '';
      let fileName = '';

      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
          fileName = selectedFile.name;
        } catch (error) {
          alert('Failed to upload file. Please try again.');
          return;
        }
      }

      const messageData = {
        senderId: auth.user._id,
        receiverId: targetUserId,
        content: newMessage,
        ...(fileUrl && { fileUrl, fileName }),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const newMsg = { ...response.data, type: 'out' };
      setMessages(prev => [...prev, newMsg]);
      socket.emit('message', response.data);
      
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!auth?.token || !newContent.trim()) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/messages/${messageId}`,
        { content: newContent, edited: true },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
        )
      );
      
      socket?.emit('messageUpdate', {
        messageId,
        content: newContent,
        edited: true,
        receiverId: isPrivateChatList ? selectedUser?._id : userId
      });

      setEditingMessageId(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!auth?.token) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, deleted: true } : msg
      ));
      
      if (socket) {
        socket.emit('messageDelete', {
          messageId,
          receiverId: isPrivateChatList ? selectedUser?._id : userId
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message === 'Cannot delete messages older than 3 hours') {
        alert('This message is too old to be deleted (older than 3 hours)');
      } else {
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = messages.filter(msg => 
        !msg.deleted && 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!auth?.token) return;
    setIsLoadingUsers(true);
    setUserListError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/with-last-message`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (Array.isArray(response.data)) {
        const usersWithOnline = response.data.map((user: User & { lastMessageAt?: string }) => ({
          ...user,
          isOnline: onlineUsers.includes(user._id)
        }));
        setUsers(usersWithOnline);
      } else {
        setUserListError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserListError('Failed to load users. Please try again later.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [auth?.token, onlineUsers]);

  useEffect(() => {
    if (auth?.token) {
      fetchUsers();
    }
  }, [auth?.token, auth?.user?._id, fetchUsers]);

  // Fetch groups
  useEffect(() => {
    if (!auth?.token) return;
    setIsLoadingGroups(true);
    setGroupListError(null);
    axios.get(`${import.meta.env.VITE_API_URL}/group`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
      .then(res => {
        setGroups(res.data || []);
      })
      .catch(() => setGroupListError('Failed to load groups.'))
      .finally(() => setIsLoadingGroups(false));
  }, [auth?.token]);

  // Fetch group messages when selectedGroup changes
  useEffect(() => {
    if (selectedGroup && auth?.token && auth?.user?._id) {
      axios.get(`${import.meta.env.VITE_API_URL}/messages/group/${selectedGroup._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
        .then(res => {
          setGroupMessages(Array.isArray(res.data) ? res.data : []);
        })
    } else {
      setGroupMessages([]);
    }
  }, [selectedGroup, auth?.token, auth?.user?._id]);

  // Fetch group details when selectedGroup changes
  useEffect(() => {
    if (selectedGroup && auth?.token) {
      axios.get(`${import.meta.env.VITE_API_URL}/group/${selectedGroup._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
        .then(res => setGroupDetails(res.data))
        .catch(() => setGroupDetails(null));
    } else {
      setGroupDetails(null);
    }
  }, [selectedGroup, auth?.token]);

  // Socket: join/leave group room and handle real-time group events
  useEffect(() => {
    if (!socket || !selectedGroup) return;
    socket.emit('joinGroup', selectedGroup._id);
    const handleGroupMessage = (msg: Message) => {
      setGroupMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        const type: 'in' | 'out' = auth?.user?._id && msg.senderId === auth.user._id ? 'out' : 'in';
        const newMsg: Message = { ...msg, type };
        const sorted = [...prev, newMsg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return sorted;
      });
    };
    const handleGroupMessageUpdate = (data: { messageId: string; content: string; edited?: boolean }) => {
      setGroupMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, content: data.content, edited: !!data.edited } : msg
      ));
    };
    const handleGroupMessageDelete = (data: { messageId: string }) => {
      setGroupMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, deleted: true } : msg
      ));
    };
    const handleGroupMetadataUpdate = (data: { 
      groupId: string; 
      type: 'members' | 'admins' | 'name' | 'deleted'; 
      data: {
        members?: string[];
        admins?: string[];
        name?: string;
        deleted?: boolean;
      };
    }) => {
      if (data.groupId === selectedGroup._id) {
        switch (data.type) {
          case 'members':
            // For group details, we need to fetch the updated group to get the full member objects
            axios.get(`${import.meta.env.VITE_API_URL}/group/${data.groupId}`, {
              headers: { Authorization: `Bearer ${auth?.token}` }
            }).then(res => {
              setGroupDetails(res.data);
            }).catch(console.error);
            
            // For groups list, we can just update the member IDs
            setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, members: data.data.members || [] } : g));
            break;
          case 'admins':
            setGroupDetails(prev => prev ? { ...prev, admins: data.data.admins || [] } : null);
            setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, admins: data.data.admins || [] } : g));
            break;
          case 'name':
            setGroupDetails(prev => prev ? { ...prev, name: data.data.name || '' } : null);
            setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, name: data.data.name || '' } : g));
            break;
          case 'deleted':
            if (data.data.deleted) {
              setGroups(prev => prev.filter(g => g._id !== data.groupId));
              setSelectedGroup(null);
              setGroupDetails(null);
              setGroupMessages([]);
            }
            break;
        }
      }
    };
    socket.on('groupMessage', handleGroupMessage);
    socket.on('groupMessageUpdate', handleGroupMessageUpdate);
    socket.on('groupMessageDelete', handleGroupMessageDelete);
    socket.on('groupMetadataUpdate', handleGroupMetadataUpdate);
    return () => {
      socket.emit('leaveGroup', selectedGroup._id);
      socket.off('groupMessage', handleGroupMessage);
      socket.off('groupMessageUpdate', handleGroupMessageUpdate);
      socket.off('groupMessageDelete', handleGroupMessageDelete);
      socket.off('groupMetadataUpdate', handleGroupMetadataUpdate);
    };
  }, [socket, selectedGroup, auth?.user?._id]);

  // Send group message
  const sendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !socket || !selectedGroup || !auth?.user?._id) return;
    try {
      let fileUrl = '';
      let fileName = '';
      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
          fileName = selectedFile.name;
        } catch (error) {
          alert('Failed to upload file. Please try again.');
          return;
        }
      }
      const messageData = {
        senderId: auth.user._id,
        groupId: selectedGroup._id,
        content: newMessage,
        ...(fileUrl && { fileUrl, fileName })
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages/group`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      socket.emit('groupMessage', response.data);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending group message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Edit group message
  const handleEditGroupMessage = async (messageId: string, newContent: string) => {
    if (!auth?.token || !newContent.trim() || !selectedGroup) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/messages/group/${messageId}`,
        { content: newContent, edited: true },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setGroupMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
        )
      );
      socket?.emit('groupMessageUpdate', {
        messageId,
        content: newContent,
        edited: true,
        groupId: selectedGroup._id
      });
      setEditingMessageId(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('Error updating group message:', error);
      alert('Failed to update message');
    }
  };

  // Delete group message
  const handleDeleteGroupMessage = async (messageId: string) => {
    if (!auth?.token || !selectedGroup) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/messages/group/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setGroupMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, deleted: true } : msg
      ));
      socket?.emit('groupMessageDelete', {
        messageId,
        groupId: selectedGroup._id
      });
    } catch (error) {
      console.error('Error deleting group message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const handleCreateGroup = async (groupName: string, memberIds: string[]) => {
    if (!auth?.token || !auth?.user?._id) return;
    // Ensure the creator is included
    const allMembers = Array.from(new Set([...memberIds, auth.user._id]));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/group`,
        { name: groupName, members: allMembers },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setGroups(prev => [...prev, response.data]);
      setSelectedGroup(response.data);
      setSelectedUser(null);
    } catch (error) {
      alert('Failed to create group.');
    }
  };

  // Add members to group
  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token || !groupDetails || selectedAddMembers.length === 0) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}/add`,
        { members: selectedAddMembers },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Refetch group details
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroupDetails(res.data);
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      setShowAddMemberModal(false);
      setSelectedAddMembers([]);
    } catch (error) {
      alert('Failed to add members.');
    }
  };

  // Remove members from group
  const handleRemoveMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token || !groupDetails || selectedRemoveMembers.length === 0) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}/remove`,
        { members: selectedRemoveMembers },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Refetch group details
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroupDetails(res.data);
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      setShowRemoveMemberModal(false);
      setSelectedRemoveMembers([]);
    } catch (error) {
      alert('Failed to remove members.');
    }
  };

  // Assign admin
  const handleMakeAdmin = async (userId: string) => {
    if (!auth?.token || !groupDetails) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}/admin`,
        { userId, action: 'add' },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroupDetails(res.data);
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
    } catch (error) {
      alert('Failed to assign admin.');
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (userId: string) => {
    if (!auth?.token || !groupDetails) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}/admin`,
        { userId, action: 'remove' },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroupDetails(res.data);
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
    } catch (error) {
      alert('Failed to remove admin.');
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    if (!auth?.token || !groupDetails) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setGroups(prev => prev.filter(g => g._id !== groupDetails._id));
      setSelectedGroup(null);
      setGroupDetails(null);
      setGroupMessages([]);
    } catch (error) {
      alert('Failed to leave group.');
    }
  };

  const isAdmin = groupDetails?.admins.some(
    (admin: GroupMember | string) =>
      (typeof admin === 'object' && auth?.user?._id && admin._id === auth.user._id) ||
      (typeof admin === 'string' && auth?.user?._id && admin === auth.user._id)
  );

  if (!auth?.user?._id) {
    return (
      <div className="card">
        <div className="card-body py-12 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted mt-3">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {isPrivateChatList ? (
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: 300, minWidth: 300 }}>
            {isLoadingUsers || isLoadingGroups ? (
              <div className="d-flex justify-content-center py-10">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : userListError || groupListError ? (
              <div className="alert alert-danger">
                {userListError || groupListError}
                <button className="btn btn-sm btn-light ms-3" onClick={fetchUsers}>
                  Retry
                </button>
              </div>
            ) : (
              <ChatSidebar
                users={users}
                groups={groups}
                onUserSelect={user => {
                  setSelectedUser(user);
                  setSelectedGroup(null);
                }}
                onGroupSelect={group => {
                  setSelectedGroup(group);
                  setSelectedUser(null);
                }}
                onCreateGroup={handleCreateGroup}
                shouldNavigate={false}
              />
            )}
          </div>
          <div className="flex-grow-1 d-flex align-items-center justify-content-center min-h-400px">
            {selectedUser ? (
    <div className="card mx-auto my-8 w-100 mw-1000px shadow" id="kt_chat_messenger">
                <ChatHeader
                  chatUser={selectedUser}
                  isOnline={!!selectedUser.isOnline}
                  onSearchClick={() => setIsSearchOpen(true)}
                  onCloseClick={() => setSelectedUser(null)}
                />
                {isSearchOpen && (
                  <MessageSearch
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                    onClose={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    searchResults={searchResults}
                    onResultClick={scrollToMessage}
                  />
                )}
                <div className="card-body p-0">
                  <div
                    className="messages-wrapper scroll-y me-n5 pe-5"
                    data-kt-element="messages"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: false, lg: true}"
                    data-kt-scroll-max-height="auto"
                    data-kt-scroll-dependencies="#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer"
                    data-kt-scroll-wrappers="#kt_content, #kt_app_content, #kt_chat_messenger_body"
                    data-kt-scroll-offset="5px"
                    style={{ height: 'calc(100vh - 400px)' }}
                  >
                    <MessageList
                      messages={messages}
                      currentUserId={auth.user._id}
                      userName={selectedUser.name}
                      onEdit={(messageId, content) => {
                        setEditingMessageId(messageId);
                        setEditMessageContent(content);
                      }}
                      onDelete={handleDeleteMessage}
                      editingMessageId={editingMessageId}
                      editContent={editMessageContent}
                      onEditContentChange={setEditMessageContent}
                      onEditSubmit={() => handleEditMessage(editingMessageId!, editMessageContent)}
                      onEditCancel={() => {
                        setEditingMessageId(null);
                        setEditMessageContent('');
                      }}
                    />
                  </div>
                </div>
                <div className="card-footer pt-4" id="kt_chat_messenger_footer">
                  <ChatInput
                    newMessage={newMessage}
                    onMessageChange={setNewMessage}
                    onFileSelect={setSelectedFile}
                    onSend={sendMessage}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                  />
                </div>
              </div>
            ) : selectedGroup ? (
    <div className="card mx-auto my-8 w-100 mw-1000px shadow" id="kt_chat_messenger">
                <GroupChatHeader
                  selectedGroup={selectedGroup}
                  groupDetails={groupDetails}
                  authUserId={auth.user._id}
                  isAdmin={!!isAdmin}
                  showGroupMenu={showGroupMenu}
                  setShowGroupMenu={setShowGroupMenu}
                  setSelectedGroup={setSelectedGroup}
                  setShowAddMemberModal={setShowAddMemberModal}
                  setShowRemoveMemberModal={setShowRemoveMemberModal}
                  setShowRenameGroupModal={setShowRenameGroupModal}
                  setShowGroupDetailsModal={setShowGroupDetailsModal}
                  setSelectedRemoveMembers={setSelectedRemoveMembers}
                  handleMakeAdmin={handleMakeAdmin}
                  handleRemoveAdmin={handleRemoveAdmin}
                  handleLeaveGroup={handleLeaveGroup}
                />
                <div className="card-body p-0">
                  <div
                    className="messages-wrapper scroll-y me-n5 pe-5"
                    data-kt-element="messages"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: false, lg: true}"
                    data-kt-scroll-max-height="auto"
                    data-kt-scroll-dependencies="#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer"
                    data-kt-scroll-wrappers="#kt_content, #kt_app_content, #kt_chat_messenger_body"
                    data-kt-scroll-offset="5px"
                    style={{ height: 'calc(100vh - 400px)' }}
                  >
                    <GroupMessageList
                      groupMessages={groupMessages}
                      groupDetails={groupDetails}
                      selectedGroup={selectedGroup}
                      currentUserId={auth.user._id}
                      editingMessageId={editingMessageId}
                      editMessageContent={editMessageContent}
                      onEdit={(messageId, content) => {
                        setEditingMessageId(messageId);
                        setEditMessageContent(content);
                      }}
                      onDelete={handleDeleteGroupMessage}
                      onEditContentChange={setEditMessageContent}
                      onEditSubmit={() => handleEditGroupMessage(editingMessageId!, editMessageContent)}
                      onEditCancel={() => {
                        setEditingMessageId(null);
                        setEditMessageContent('');
                      }}
                    />
                  </div>
                </div>
                <GroupChatInput
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onFileSelect={setSelectedFile}
                  onSend={sendGroupMessage}
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                />
                <GroupModals
                  showAddMemberModal={showAddMemberModal}
                  setShowAddMemberModal={setShowAddMemberModal}
                  showRemoveMemberModal={showRemoveMemberModal}
                  setShowRemoveMemberModal={setShowRemoveMemberModal}
                  showGroupDetailsModal={showGroupDetailsModal}
                  setShowGroupDetailsModal={setShowGroupDetailsModal}
                  showRenameGroupModal={showRenameGroupModal}
                  setShowRenameGroupModal={setShowRenameGroupModal}
                  groupDetails={groupDetails}
                  users={users}
                  selectedAddMembers={selectedAddMembers}
                  setSelectedAddMembers={setSelectedAddMembers}
                  handleAddMembers={handleAddMembers}
                  selectedRemoveMembers={selectedRemoveMembers}
                  setSelectedRemoveMembers={setSelectedRemoveMembers}
                  handleRemoveMembers={handleRemoveMembers}
                  renameGroupName={renameGroupName}
                  setRenameGroupName={setRenameGroupName}
                  handleRenameGroup={async e => {
                    e.preventDefault();
                    if (!auth?.token || !renameGroupName.trim() || !groupDetails) return;
                    try {
                      await axios.put(
                        `${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`,
                        { name: renameGroupName.trim() },
                        { headers: { Authorization: `Bearer ${auth.token}` } }
                      );
                      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupDetails._id}`, {
                        headers: { Authorization: `Bearer ${auth.token}` }
                      });
                      setGroupDetails(res.data);
                      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
                      setShowRenameGroupModal(false);
                    } catch (error) {
                      alert('Failed to rename group.');
                    }
                  }}
                  authUserId={auth.user._id}
                />
              </div>
            ) : (
              <div className="text-center w-100">
                <i className="ki-duotone ki-message-text-2 fs-5tx text-primary mb-5">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <h3 className="text-gray-800 mb-2">Select a chat to start messaging</h3>
                <div className="text-muted">Choose from your contacts list or groups to start a conversation</div>
              </div>
            )}
          </div>
        </div>
      ) : chatUser ? (
        <div className="card mx-auto my-8 w-100 mw-1000px shadow" id="kt_chat_messenger">
          <ChatHeader
            chatUser={chatUser}
            isOnline={isOnline}
            onSearchClick={() => setIsSearchOpen(true)}
            onCloseClick={() => navigate('/chat/private')}
          />

          {isSearchOpen && (
            <MessageSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              onClose={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              searchResults={searchResults}
              onResultClick={scrollToMessage}
            />
          )}

          <div className="card-body p-0">
            <div 
              className="messages-wrapper scroll-y me-n5 pe-5"
              data-kt-element="messages"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default: false, lg: true}"
              data-kt-scroll-max-height="auto"
              data-kt-scroll-dependencies="#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer"
              data-kt-scroll-wrappers="#kt_content, #kt_app_content, #kt_chat_messenger_body"
              data-kt-scroll-offset="5px"
              style={{ height: 'calc(100vh - 400px)' }}
            >
                <MessageList
                  messages={messages}
                  currentUserId={auth.user._id}
                  userName={chatUser.name}
                  onEdit={(messageId, content) => {
                    setEditingMessageId(messageId);
                    setEditMessageContent(content);
                  }}
                  onDelete={handleDeleteMessage}
                  editingMessageId={editingMessageId}
                  editContent={editMessageContent}
                  onEditContentChange={setEditMessageContent}
                  onEditSubmit={() => handleEditMessage(editingMessageId!, editMessageContent)}
                  onEditCancel={() => {
                    setEditingMessageId(null);
                    setEditMessageContent('');
                  }}
                />
            </div>

            <div 
              className="card-footer pt-4" 
              id="kt_chat_messenger_footer"
            >
              <ChatInput
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onFileSelect={setSelectedFile}
                onSend={sendMessage}
                selectedFile={selectedFile}
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow-1 d-flex align-items-center justify-content-center min-h-400px">
          <div className="text-center">
            <i className="ki-duotone ki-message-text-2 fs-5tx text-primary mb-5">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            <h3 className="text-gray-800 mb-2">Select a chat to start messaging</h3>
            <div className="text-muted">Choose from your contacts list to start a conversation</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 