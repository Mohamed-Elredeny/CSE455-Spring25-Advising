import React from 'react';

interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

interface GroupChatHeaderProps {
  selectedGroup: { _id: string; name: string };
  groupDetails: any;
  authUserId: string;
  isAdmin: boolean;
  showGroupMenu: boolean;
  setShowGroupMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<any>>;
  setShowAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRenameGroupModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowGroupDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRemoveMembers: React.Dispatch<React.SetStateAction<string[]>>;
  handleMakeAdmin: (userId: string) => void;
  handleRemoveAdmin: (userId: string) => void;
  handleLeaveGroup: () => void;
}

const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
  selectedGroup,
  groupDetails,
  authUserId,
  isAdmin,
  showGroupMenu,
  setShowGroupMenu,
  setSelectedGroup,
  setShowAddMemberModal,
  setShowRemoveMemberModal,
  setShowRenameGroupModal,
  setShowGroupDetailsModal,
  setSelectedRemoveMembers,
  handleMakeAdmin,
  handleRemoveAdmin,
  handleLeaveGroup,
}) => (
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
                  {groupDetails.admins.includes(authUserId) && m._id !== authUserId && (
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
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-light-info" onClick={() => setSelectedGroup(null)}>
          <i className="ki-duotone ki-cross-square fs-2">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </button>
        <div className="position-relative">
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
  </div>
);

export default GroupChatHeader; 