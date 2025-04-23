import {Route, Routes, Outlet, Navigate, useNavigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import UserList from '../../../components/users/UserList'
import { useAuth } from '../../../modules/auth/core/Auth'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  unreadCount?: number;
}

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '/apps/user-management/users',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleUserSelect = (user: User) => {
    navigate(`/chat/${user._id}`);
  };

  const fetchUsers = async () => {
    if (!auth?.token) return;
    
    setIsLoading(true);
    setError(null);
    
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
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
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
      auth: {
        token: auth?.token
      }
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

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='users'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle>
              <div className="card card-custom gutter-b">
                <div className="card-header">
                  <div className="card-title">
                    <h3 className="card-label">Chat</h3>
                  </div>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="d-flex justify-content-center py-10">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">
                      {error}
                      <button 
                        className="btn btn-sm btn-light ms-3" 
                        onClick={fetchUsers}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <UserList 
                      users={users} 
                      onUserSelect={handleUserSelect}
                    />
                  )}
                </div>
              </div>
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/user-management/users' />} />
    </Routes>
  )
}

export default UsersPage
