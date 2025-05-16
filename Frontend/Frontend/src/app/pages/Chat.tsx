import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
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

  useEffect(() => {
    const fetchChatUser = async () => {
      if (!userId || !auth?.token) return;
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        if (response.data && response.data._id) {
          setChatUser(response.data);
        } else {
          navigate('/users');
        }
      } catch (error) {
        console.error('Error fetching chat user:', error);
        navigate('/users');
      }
    };

    const fetchMessages = async () => {
      if (!userId || !auth?.token || !auth?.user?._id) return;
      
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
        console.error('Error fetching messages:', error);
      }
    };

    fetchChatUser();
    fetchMessages();
  }, [userId, auth?.token, auth?.user?._id, navigate]);

  useEffect(() => {
    if (!auth?.token) return;

    const socketInstance: Socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: {
        token: auth?.token
      }
    });
    
    socketInstance.on('connect', () => {
      socketInstance.emit('getOnlineUsers');
    });

    socketInstance.on('onlineUsers', (onlineUsers: string[]) => {
      setIsOnline(onlineUsers.includes(chatUser?._id || ''));
    });

    socketInstance.on('userOnline', (data: { userId: string }) => {
      if (chatUser && data.userId === chatUser._id) {
        setIsOnline(true);
      }
    });

    socketInstance.on('userOffline', (data: { userId: string }) => {
      if (chatUser && data.userId === chatUser._id) {
        setIsOnline(false);
      }
    });

    socketInstance.on('message', (data) => {
      if (data.senderId === userId || data.receiverId === userId) {
        const messageType = data.senderId === auth?.user?._id ? 'out' : 'in';
        const newMessage = { ...data, type: messageType };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [auth?.token, chatUser, userId, auth?.user?._id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('messageUpdate', ({ messageId, content, edited }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, content, edited: !!edited } : msg
        )
      );
    });

    socket.on('messageDelete', ({ messageId }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, deleted: true } : msg
      ));
    });

    return () => {
      socket.off('messageUpdate');
      socket.off('messageDelete');
    };
  }, [socket]);

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
    if ((!newMessage.trim() && !selectedFile) || !socket || !userId || !auth?.user?._id) return;

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
        receiverId: userId,
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
        receiverId: userId
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
      
      if (socket && userId) {
        socket.emit('messageDelete', {
          messageId,
          receiverId: userId
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

  const fetchUsers = async () => {
    if (!auth?.token) return;
    setIsLoadingUsers(true);
    setUserListError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (Array.isArray(response.data)) {
        const filteredUsers = response.data
          .filter((user: User) => user._id !== auth?.user?._id)
          .map((user: User) => ({
            ...user,
            isOnline: onlineUsers.includes(user._id)
          }));
        setUsers(filteredUsers);
      } else {
        setUserListError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserListError('Failed to load users. Please try again later.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchUsers();
    }
  }, [auth?.token, auth?.user?._id]);

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
    });
    socketInstance.on('userOnline', (data: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId ? { ...user, isOnline: true } : user
        )
      );
    });
    socketInstance.on('userOffline', (data: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.userId ? { ...user, isOnline: false } : user
        )
      );
    });
    return () => {
      socketInstance.disconnect();
    };
  }, [auth?.token]);

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
      {!chatUser ? (
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: 300, minWidth: 300 }}>
            {isLoadingUsers ? (
              <div className="d-flex justify-content-center py-10">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : userListError ? (
              <div className="alert alert-danger">
                {userListError}
                <button className="btn btn-sm btn-light ms-3" onClick={fetchUsers}>
                  Retry
                </button>
              </div>
            ) : (
              <ChatSidebar
                users={users}
                onUserSelect={(user) => {
                  navigate(`/chat/${user._id}`);
                }}
              />
            )}
          </div>
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
        </div>
      ) : (
        <div className="card mx-auto my-8 w-100 mw-1000px shadow" id="kt_chat_messenger">
          <ChatHeader
            chatUser={chatUser}
            isOnline={isOnline}
            onSearchClick={() => setIsSearchOpen(true)}
            onCloseClick={() => navigate('/users')}
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
              <div className="messages d-flex flex-column px-5">
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
      )}
    </div>
  );
};

export default Chat; 