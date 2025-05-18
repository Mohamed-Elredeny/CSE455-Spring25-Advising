import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../modules/auth/core/Auth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Message, User, Group, GroupDetails } from '../types/chat';

export const useChat = (userId?: string, isPrivateChatList?: boolean) => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Initialize socket connection
  useEffect(() => {
    if (!auth?.token) {
      console.log('No auth token available');
      return;
    }

    console.log('Initializing socket connection');
    const socketInstance: Socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: { token: auth?.token }
    });
    
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      socketInstance.emit('getOnlineUsers');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketInstance.on('onlineUsers', (onlineUsers: string[]) => {
      console.log('Received online users:', onlineUsers);
      if (userId) {
        setIsOnline(onlineUsers.includes(userId));
      }
    });

    socketInstance.on('userOnline', (data: { userId: string }) => {
      console.log('User online:', data);
      if (userId && data.userId === userId) {
        setIsOnline(true);
      }
    });

    socketInstance.on('userOffline', (data: { userId: string }) => {
      console.log('User offline:', data);
      if (userId && data.userId === userId) {
        setIsOnline(false);
      }
    });

    socketInstance.on('message', (data) => {
      console.log('Received message:', data);
      if (userId && (data.senderId === userId || data.receiverId === userId)) {
        const messageType = data.senderId === auth?.user?._id ? 'out' : 'in';
        const newMessage = { ...data, type: messageType };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    socketInstance.on('messageUpdate', ({ messageId, content, edited, receiverId }) => {
      console.log('Message update:', { messageId, content, edited, receiverId });
      if (userId && (receiverId === auth?.user?._id || receiverId === userId)) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, content, edited: !!edited } : msg
          )
        );
      }
    });

    socketInstance.on('messageDelete', ({ messageId, receiverId }) => {
      console.log('Message delete:', { messageId, receiverId });
      if (userId && (receiverId === auth?.user?._id || receiverId === userId)) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, deleted: true } : msg
        ));
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [auth?.token, auth?.user?._id, userId]);

  // Fetch chat user
  useEffect(() => {
    const fetchChatUser = async () => {
      if (!auth?.token || !auth?.user?._id) {
        console.log('Cannot fetch chat user: No auth token or user ID');
        return;
      }

      if (!userId) {
        console.log('Cannot fetch chat user: No target user ID');
        return;
      }

      console.log('Fetching chat user:', userId);
      try {
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        if (userResponse.data && userResponse.data._id) {
          console.log('Chat user fetched:', userResponse.data);
          setChatUser(userResponse.data);
        } else {
          console.log('Invalid chat user response');
          setChatUser(null);
        }
      } catch (error) {
        console.error('Error fetching chat user:', error);
        setChatUser(null);
      }
    };

    fetchChatUser();
  }, [userId, auth?.token, auth?.user?._id]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!auth?.token || !auth?.user?._id) {
        console.log('Cannot fetch messages: No auth token or user ID');
        return;
      }

      if (!userId) {
        console.log('Cannot fetch messages: No target user ID');
        return;
      }

      console.log('Fetching messages for users:', { userId, currentUserId: auth.user._id });
      try {
        const messagesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/messages?userId=${userId}&currentUserId=${auth.user._id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        if (Array.isArray(messagesResponse.data)) {
          console.log('Messages fetched:', messagesResponse.data);
          setMessages(messagesResponse.data);
        } else {
          console.log('Invalid messages response');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [userId, auth?.token, auth?.user?._id]);

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

  const sendMessage = async (content: string) => {
    console.log('Attempting to send message:', { content, userId });
    
    if (!userId) {
      console.log('Cannot send message: No target user ID');
      return;
    }

    if (!socket) {
      console.log('Cannot send message: No socket connection');
      return;
    }

    if (!auth?.user?._id) {
      console.log('Cannot send message: No current user ID');
      return;
    }

    if (!content.trim() && !selectedFile) {
      console.log('Cannot send message: Empty content and no file');
      return;
    }

    try {
      let fileUrl = '';
      let fileName = '';

      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
          fileName = selectedFile.name;
        } catch (error) {
          console.error('File upload failed:', error);
          alert('Failed to upload file. Please try again.');
          return;
        }
      }

      const messageData = {
        senderId: auth.user._id,
        receiverId: userId,
        content,
        ...(fileUrl && { fileUrl, fileName }),
      };

      console.log('Sending message data:', messageData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      console.log('Message sent successfully:', response.data);

      const newMsg = { ...response.data, type: 'out' };
      setMessages(prev => [...prev, newMsg]);
      socket.emit('message', response.data);
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!auth?.token || !newContent.trim()) {
      console.log('Cannot edit message: Invalid auth or content');
      return;
    }

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
    if (!auth?.token) {
      console.log('Cannot delete message: No auth token');
      return;
    }

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

  return {
    messages,
    chatUser,
    isOnline,
    selectedFile,
    setSelectedFile,
    isUploading,
    editingMessageId,
    setEditingMessageId,
    editMessageContent,
    setEditMessageContent,
    sendMessage,
    handleEditMessage,
    handleDeleteMessage,
    uploadFile
  };
}; 