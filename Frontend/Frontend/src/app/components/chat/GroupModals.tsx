import React from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

interface GroupDetails {
  _id: string;
  name: string;
  admins: (GroupMember | string)[];
  members: (GroupMember | string)[];
  createdBy: string;
}

interface GroupModalsProps {
  showAddMemberModal: boolean;
  setShowAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
  showRemoveMemberModal: boolean;
  setShowRemoveMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
  showGroupDetailsModal: boolean;
  setShowGroupDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  showRenameGroupModal: boolean;
  setShowRenameGroupModal: React.Dispatch<React.SetStateAction<boolean>>;
  groupDetails: GroupDetails | null;
  users: User[];
  selectedAddMembers: string[];
  setSelectedAddMembers: React.Dispatch<React.SetStateAction<string[]>>;
  handleAddMembers: (e: React.FormEvent) => void;
  selectedRemoveMembers: string[];
  setSelectedRemoveMembers: React.Dispatch<React.SetStateAction<string[]>>;
  handleRemoveMembers: (e: React.FormEvent) => void;
  renameGroupName: string;
  setRenameGroupName: React.Dispatch<React.SetStateAction<string>>;
  handleRenameGroup: (e: React.FormEvent) => void;
  authUserId: string;
}

const GroupModals: React.FC<GroupModalsProps> = ({
  showAddMemberModal,
  setShowAddMemberModal,
  showRemoveMemberModal,
  setShowRemoveMemberModal,
  showGroupDetailsModal,
  setShowGroupDetailsModal,
  showRenameGroupModal,
  setShowRenameGroupModal,
  groupDetails,
  users,
  selectedAddMembers,
  setSelectedAddMembers,
  handleAddMembers,
  selectedRemoveMembers,
  setSelectedRemoveMembers,
  handleRemoveMembers,
  renameGroupName,
  setRenameGroupName,
  handleRenameGroup,
  authUserId,
}) => (
  <>
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
                  {groupDetails.members.filter((m: GroupMember | string) => typeof m === 'object' && m._id !== authUserId).map((m: GroupMember | string) => (
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
            <form onSubmit={handleRenameGroup}>
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
  </>
);

export default GroupModals; 