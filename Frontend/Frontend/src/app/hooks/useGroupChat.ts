import { useState, useEffect } from 'react';
import { useAuth } from '../modules/auth/core/Auth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Message, User, Group, GroupDetails } from '../types/chat';

export const useGroupChat = (selectedGroup: Group | null) => {
  const { auth } = useAuth();
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Initialize socket connection
  useEffect(() => {
    if (!auth?.token) return;

    const socketInstance: Socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      auth: { token: auth?.token }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
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
            break;
          case 'admins':
            setGroupDetails(prev => prev ? { ...prev, admins: data.data.admins || [] } : null);
            break;
          case 'name':
            setGroupDetails(prev => prev ? { ...prev, name: data.data.name || '' } : null);
            break;
          case 'deleted':
            if (data.data.deleted) {
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
  }, [socket, selectedGroup, auth?.user?._id, auth?.token]);

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

  const sendGroupMessage = async (content: string) => {
    if ((!content.trim() && !selectedFile) || !socket || !selectedGroup || !auth?.user?._id) return;
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
        content,
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
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending group message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

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

  return {
    groupMessages,
    groupDetails,
    selectedFile,
    setSelectedFile,
    isUploading,
    editingMessageId,
    setEditingMessageId,
    editMessageContent,
    setEditMessageContent,
    sendGroupMessage,
    handleEditGroupMessage,
    handleDeleteGroupMessage,
    uploadFile
  };
}; 