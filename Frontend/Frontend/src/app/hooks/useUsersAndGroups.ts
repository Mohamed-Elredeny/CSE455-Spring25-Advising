import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../modules/auth/core/Auth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { User, Group } from '../types/chat';

export const useUsersAndGroups = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [userListError, setUserListError] = useState<string | null>(null);
  const [groupListError, setGroupListError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
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

    socketInstance.on('groupMetadataUpdate', (data: { 
      groupId: string; 
      type: 'members' | 'admins' | 'name' | 'deleted'; 
      data: {
        members?: string[];
        admins?: string[];
        name?: string;
        deleted?: boolean;
      };
    }) => {
      switch (data.type) {
        case 'members':
          setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, members: data.data.members || [] } : g));
          break;
        case 'admins':
          setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, admins: data.data.admins || [] } : g));
          break;
        case 'name':
          setGroups(prev => prev.map(g => g._id === data.groupId ? { ...g, name: data.data.name || '' } : g));
          break;
        case 'deleted':
          if (data.data.deleted) {
            setGroups(prev => prev.filter(g => g._id !== data.groupId));
          }
          break;
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [auth?.token]);

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
      socket?.emit('groupMetadataUpdate', {
        groupId: response.data._id,
        type: 'members',
        data: { members: allMembers }
      });
      return response.data;
    } catch (error) {
      alert('Failed to create group.');
      throw error;
    }
  };

  const handleAddMembers = async (groupId: string, members: string[]) => {
    if (!auth?.token || members.length === 0) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}/add`,
        { members },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Refetch group details
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'members',
        data: { members: res.data.members }
      });
      return res.data;
    } catch (error) {
      alert('Failed to add members.');
      throw error;
    }
  };

  const handleRemoveMembers = async (groupId: string, members: string[]) => {
    if (!auth?.token || members.length === 0) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}/remove`,
        { members },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Refetch group details
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'members',
        data: { members: res.data.members }
      });
      return res.data;
    } catch (error) {
      alert('Failed to remove members.');
      throw error;
    }
  };

  const handleMakeAdmin = async (groupId: string, userId: string) => {
    if (!auth?.token) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}/admin`,
        { userId, action: 'add' },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'admins',
        data: { admins: res.data.admins }
      });
      return res.data;
    } catch (error) {
      alert('Failed to assign admin.');
      throw error;
    }
  };

  const handleRemoveAdmin = async (groupId: string, userId: string) => {
    if (!auth?.token) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}/admin`,
        { userId, action: 'remove' },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'admins',
        data: { admins: res.data.admins }
      });
      return res.data;
    } catch (error) {
      alert('Failed to remove admin.');
      throw error;
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!auth?.token) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setGroups(prev => prev.filter(g => g._id !== groupId));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'members',
        data: { members: [] } // The server will handle the actual member removal
      });
    } catch (error) {
      alert('Failed to leave group.');
      throw error;
    }
  };

  const handleRenameGroup = async (groupId: string, newName: string) => {
    if (!auth?.token || !newName.trim()) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/group/${groupId}`,
        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setGroups(prev => prev.map(g => g._id === res.data._id ? res.data : g));
      socket?.emit('groupMetadataUpdate', {
        groupId,
        type: 'name',
        data: { name: newName.trim() }
      });
      return res.data;
    } catch (error) {
      alert('Failed to rename group.');
      throw error;
    }
  };

  return {
    users,
    groups,
    isLoadingUsers,
    isLoadingGroups,
    userListError,
    groupListError,
    onlineUsers,
    setOnlineUsers,
    fetchUsers,
    handleCreateGroup,
    handleAddMembers,
    handleRemoveMembers,
    handleMakeAdmin,
    handleRemoveAdmin,
    handleLeaveGroup,
    handleRenameGroup
  };
}; 