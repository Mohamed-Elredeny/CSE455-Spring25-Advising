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
    socket.on('groupMessage', handleGroupMessage);
    socket.on('groupMessageUpdate', handleGroupMessageUpdate);
    socket.on('groupMessageDelete', handleGroupMessageDelete);
    return () => {
      socket.emit('leaveGroup', selectedGroup._id);
      socket.off('groupMessage', handleGroupMessage);
      socket.off('groupMessageUpdate', handleGroupMessageUpdate);
      socket.off('groupMessageDelete', handleGroupMessageDelete);
    };
  }, [socket, selectedGroup]);

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
                <div className="chat-header">
                  <div className="d-flex justify-content-between align-items-center h-100">
                    <div className="d-flex align-items-center">
                      <div className="symbol symbol-35px symbol-circle me-3">
                        <span className="symbol-label bg-light-info text-info">
                          {selectedGroup.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="fs-4 text-dark mb-0">{selectedGroup.name}</h3>
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <span className="fs-7 text-muted">Members:</span>
                          {groupDetails?.members.map((m: GroupMember | string) =>
                            typeof m === 'object' && m !== null && 'name' in m && '_id' in m ? (
                              <span key={m._id} className="badge bg-light-info text-info fw-bold me-1 d-flex align-items-center">
                                {m.name}
                                {groupDetails.admins.includes(m._id) && <span className="ms-1 text-warning">★</span>}
                                {groupDetails.admins.includes(auth.user._id) && m._id !== auth.user._id && (
                                  <>
                                    {!groupDetails.admins.includes(m._id) && (
                                      <button className="btn btn-xs btn-link text-primary ms-1 p-0" title="Make Admin" onClick={() => handleMakeAdmin(m._id)}>Make Admin</button>
                                    )}
                                    {groupDetails.admins.length > 1 && groupDetails.admins.includes(m._id) && (
                                      <button className="btn btn-xs btn-link text-danger ms-1 p-0" title="Remove Admin" onClick={() => handleRemoveAdmin(m._id)}>Remove Admin</button>
                                    )}
                                    <button className="btn btn-xs btn-link text-danger ms-1 p-0" title="Remove Member" onClick={() => { setSelectedRemoveMembers([m._id]); setShowRemoveMemberModal(true); }}>Remove</button>
                                  </>
                                )}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                    {groupDetails?.admins.includes(auth.user._id) && (
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-light-info" onClick={() => setSelectedGroup(null)}>
                          <i className="ki-duotone ki-cross-square fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </button>
                      </div>
                    )}
                    <div className="position-relative ms-2">
                      <button className="btn btn-sm btn-light" onClick={() => setShowGroupMenu(v => !v)} title="Group Options">
                        <i className="bi bi-list" style={{ fontSize: 24 }} />
                      </button>
                      {showGroupMenu && (
                        <div className="dropdown-menu show p-0 mt-2" style={{ right: 0, left: 'auto', minWidth: 180, zIndex: 1000, position: 'absolute' }}>
                          {isAdmin ? (
                            <>
                              <button className="dropdown-item" onClick={() => { setShowAddMemberModal(true); setShowGroupMenu(false); }}>Add Member</button>
                              <button className="dropdown-item" onClick={() => { setShowRemoveMemberModal(true); setShowGroupMenu(false); }}>Remove Member</button>
                              <button className="dropdown-item" onClick={() => { setShowRenameGroupModal(true); setShowGroupMenu(false); }}>Rename Group</button>
                              <div className="dropdown-divider"></div>
                              <button className="dropdown-item" onClick={() => { setShowGroupDetailsModal(true); setShowGroupMenu(false); }}>Group Details</button>
                              <button className="dropdown-item text-danger" onClick={() => { setShowGroupMenu(false); handleLeaveGroup(); }}>Leave Group</button>
                            </>
                          ) : (
                            <>
                              <button className="dropdown-item" onClick={() => { setShowGroupDetailsModal(true); setShowGroupMenu(false); }}>Group Details</button>
                              <button className="dropdown-item text-danger" onClick={() => { setShowGroupMenu(false); handleLeaveGroup(); }}>Leave Group</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                      messages={groupMessages}
                      currentUserId={auth.user._id}
                      userName={selectedGroup.name}
                      onEdit={(messageId, content) => {
                        setEditingMessageId(messageId);
                        setEditMessageContent(content);
                      }}
                      onDelete={handleDeleteGroupMessage}
                      editingMessageId={editingMessageId}
                      editContent={editMessageContent}
                      onEditContentChange={setEditMessageContent}
                      onEditSubmit={() => handleEditGroupMessage(editingMessageId!, editMessageContent)}
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
                    onSend={sendGroupMessage}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                  />
                </div>
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
      {showAddMemberModal && groupDetails && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddMembers}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Members</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddMemberModal(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Select users to add</label>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {users
                      .filter(u => !groupDetails.members.some((m: GroupMember | string) => typeof m === 'object' && m._id === u._id))
                      .map(u => (
                        <div key={u._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`add-user-checkbox-${u._id}`}
                            value={u._id}
                            checked={selectedAddMembers.includes(u._id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedAddMembers(prev => [...prev, u._id]);
                              } else {
                                setSelectedAddMembers(prev => prev.filter(id => id !== u._id));
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`add-user-checkbox-${u._id}`}>{u.name} ({u.email})</label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={selectedAddMembers.length === 0}>Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showRemoveMemberModal && groupDetails && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleRemoveMembers}>
                <div className="modal-header">
                  <h5 className="modal-title">Remove Members</h5>
                  <button type="button" className="btn-close" onClick={() => setShowRemoveMemberModal(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Select members to remove</label>
                  <select className="form-select" multiple value={selectedRemoveMembers} onChange={e => setSelectedRemoveMembers(Array.from(e.target.selectedOptions, o => o.value))}>
                    {groupDetails.members.filter((m: GroupMember | string) => typeof m === 'object' && m._id !== auth.user._id).map((m: GroupMember | string) => (
                      typeof m === 'object' && m !== null && 'name' in m && '_id' in m ? (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ) : null
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowRemoveMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger" disabled={selectedRemoveMembers.length === 0}>Remove</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showGroupDetailsModal && groupDetails && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Group Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowGroupDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div><strong>Group Name:</strong> {groupDetails.name}</div>
                <div className="mt-2"><strong>Admins:</strong></div>
                <ul>
                  {groupDetails.admins.map((admin: GroupMember | string) =>
                    typeof admin === 'object' && admin !== null && 'name' in admin && 'email' in admin ? (
                      <li key={admin._id}>{admin.name} ({admin.email})</li>
                    ) : null
                  )}
                </ul>
                <div className="mt-2"><strong>Members:</strong></div>
                <ul>
                  {groupDetails.members.map((m: GroupMember | string) =>
                    typeof m === 'object' && m !== null && 'name' in m && '_id' in m ? (
                      <li key={m._id}>{m.name} ({m.email})</li>
                    ) : null
                  )}
                </ul>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowGroupDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRenameGroupModal && groupDetails && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={async e => {
                e.preventDefault();
                if (!auth?.token || !renameGroupName.trim()) return;
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
              }}>
                <div className="modal-header">
                  <h5 className="modal-title">Rename Group</h5>
                  <button type="button" className="btn-close" onClick={() => setShowRenameGroupModal(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">New Group Name</label>
                  <input type="text" className="form-control" value={renameGroupName} onChange={e => setRenameGroupName(e.target.value)} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowRenameGroupModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!renameGroupName.trim()}>Rename</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 