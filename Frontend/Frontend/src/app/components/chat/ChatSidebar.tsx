import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../users/UserList';

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

interface ChatSidebarProps {
  users: User[];
  groups: Group[];
  onUserSelect: (user: User) => void;
  onGroupSelect: (group: Group) => void;
  onCreateGroup: (groupName: string, memberIds: string[]) => void;
  shouldNavigate?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ users, groups, onUserSelect, onGroupSelect, onCreateGroup, shouldNavigate = true }) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleUserSelect = useCallback((user: User) => {
    onUserSelect(user);
    if (shouldNavigate) {
      navigate(`/chat/${user._id}`);
    }
  }, [onUserSelect, shouldNavigate, navigate]);

  const handleGroupSelect = useCallback((group: Group) => {
    onGroupSelect(group);
    if (shouldNavigate) {
      navigate(`/chat/group/${group._id}`);
    }
  }, [onGroupSelect, shouldNavigate, navigate]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length < 2) return;
    onCreateGroup(groupName.trim(), selectedMembers);
    setShowCreateModal(false);
    setGroupName('');
    setSelectedMembers([]);
  };

  return (
    <div className="chat-sidebar px-4">
      <h3 className="card-label mb-2">All Chats</h3>
      <UserList users={users} onUserSelect={handleUserSelect} />
      <div className="d-flex align-items-center justify-content-between mt-6 mb-2">
        <h3 className="card-label mb-0">Groups</h3>
        <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)} title="Create Group">
          <i className="ki-duotone ki-plus fs-5" />
        </button>
      </div>
      <ul className="list-unstyled">
        {groups.map(group => (
          <li key={group._id} className="mb-2">
            <button className="btn btn-light w-100 text-start" onClick={() => handleGroupSelect(group)}>
              <i className="ki-duotone ki-group fs-4 me-2" />
              {group.name}
            </button>
          </li>
        ))}
      </ul>
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateGroup}>
                <div className="modal-header">
                  <h5 className="modal-title">Create Group</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Group Name</label>
                    <input type="text" className="form-control" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Members (select at least 2)</label>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {users.map(user => (
                        <div key={user._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`user-checkbox-${user._id}`}
                            value={user._id}
                            checked={selectedMembers.includes(user._id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedMembers(prev => [...prev, user._id]);
                              } else {
                                setSelectedMembers(prev => prev.filter(id => id !== user._id));
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`user-checkbox-${user._id}`}>
                            {user.name} ({user.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!groupName.trim() || selectedMembers.length < 2}>Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar; 