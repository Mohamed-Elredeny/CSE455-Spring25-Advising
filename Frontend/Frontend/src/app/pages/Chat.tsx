import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/core/Auth';
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
import { useChat } from '../hooks/useChat';
import { useGroupChat } from '../hooks/useGroupChat';
import { useUsersAndGroups } from '../hooks/useUsersAndGroups';
import { User, Group, Message, GroupMember } from '../types/chat';

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { auth } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
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

  const {
    users,
    groups,
    isLoadingUsers,
    isLoadingGroups,
    userListError,
    groupListError,
    fetchUsers,
    handleCreateGroup,
    handleAddMembers,
    handleRemoveMembers,
    handleMakeAdmin,
    handleRemoveAdmin,
    handleLeaveGroup,
    handleRenameGroup
  } = useUsersAndGroups();

  // Fetch users and groups on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update selectedUser when userId changes
  useEffect(() => {
    if (userId && !isPrivateChatList) {
      // Find user in users list
      const user = users.find(u => u._id === userId);
      if (user) {
        setSelectedUser(user);
        setSelectedGroup(null);
      }
    }
  }, [userId, users, isPrivateChatList]);

  const {
    messages,
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
    handleDeleteMessage
  } = useChat(selectedUser?._id, isPrivateChatList);

  const {
    groupMessages,
    groupDetails,
    selectedFile: groupSelectedFile,
    setSelectedFile: setGroupSelectedFile,
    isUploading: isGroupUploading,
    editingMessageId: groupEditingMessageId,
    setEditingMessageId: setGroupEditingMessageId,
    editMessageContent: groupEditMessageContent,
    setEditMessageContent: setGroupEditMessageContent,
    sendGroupMessage,
    handleEditGroupMessage,
    handleDeleteGroupMessage
  } = useGroupChat(selectedGroup);

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
    <div className="chat-page-outer" style={{ minHeight: '100vh', background: '#f5f8fa' }}>
      <div className="chat-main-container" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', height: 'calc(100vh - 80px)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', background: '#fff' }}>
        {isPrivateChatList ? (
          <>
            <div className="chat-sidebar" style={{ width: 300, minWidth: 300, borderRight: '1px solid #e4e6ef', background: '#fff', overflowY: 'auto' }}>
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
            <div className="chat-content flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '400px', background: 'transparent', padding: 0 }}>
              <div className="card shadow-lg" id="kt_chat_messenger" style={{ maxWidth: 800, width: '100%', margin: '40px 0', borderRadius: 16, background: '#fff' }}>
                {selectedUser && (
                  <>
                    <ChatHeader
                      chatUser={selectedUser}
                      isOnline={isOnline}
                      onSearchClick={() => setIsSearchOpen(true)}
                      onCloseClick={() => setSelectedUser(null)}
                    />
                    {isSearchOpen && (
                      <MessageSearch
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        onClose={() => {
                          setIsSearchOpen(false);
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
                        onSend={() => { sendMessage(newMessage); setNewMessage(''); }}
                        selectedFile={selectedFile}
                        isUploading={isUploading}
                      />
                    </div>
                  </>
                )}
                {selectedGroup && (
                  <>
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
                      handleMakeAdmin={(userId: string) => groupDetails && handleMakeAdmin(groupDetails._id, userId)}
                      handleRemoveAdmin={(userId: string) => groupDetails && handleRemoveAdmin(groupDetails._id, userId)}
                      handleLeaveGroup={() => groupDetails && handleLeaveGroup(groupDetails._id)}
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
                          editingMessageId={groupEditingMessageId}
                          editMessageContent={groupEditMessageContent}
                          onEdit={(messageId, content) => {
                            setGroupEditingMessageId(messageId);
                            setGroupEditMessageContent(content);
                          }}
                          onDelete={handleDeleteGroupMessage}
                          onEditContentChange={setGroupEditMessageContent}
                          onEditSubmit={() => handleEditGroupMessage(groupEditingMessageId!, groupEditMessageContent)}
                          onEditCancel={() => {
                            setGroupEditingMessageId(null);
                            setGroupEditMessageContent('');
                          }}
                        />
                      </div>
                    </div>
                    <div className="card-footer pt-4" id="kt_chat_messenger_footer">
                      <GroupChatInput
                        newMessage={newMessage}
                        onMessageChange={setNewMessage}
                        onFileSelect={setGroupSelectedFile}
                        onSend={() => { sendGroupMessage(newMessage); setNewMessage(''); }}
                        selectedFile={groupSelectedFile}
                        isUploading={isGroupUploading}
                      />
                    </div>
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
                      handleAddMembers={(e: React.FormEvent) => {
                        e.preventDefault();
                        if (groupDetails && selectedAddMembers.length > 0) {
                          handleAddMembers(groupDetails._id, selectedAddMembers);
                        }
                      }}
                      selectedRemoveMembers={selectedRemoveMembers}
                      setSelectedRemoveMembers={setSelectedRemoveMembers}
                      handleRemoveMembers={async (e: React.FormEvent) => {
                        e.preventDefault();
                        if (groupDetails && selectedRemoveMembers.length > 0) {
                          await handleRemoveMembers(groupDetails._id, selectedRemoveMembers);
                          setShowRemoveMemberModal(false);
                          setSelectedRemoveMembers([]);
                        }
                      }}
                      renameGroupName={renameGroupName}
                      setRenameGroupName={setRenameGroupName}
                      handleRenameGroup={async e => {
                        e.preventDefault();
                        if (!renameGroupName.trim() || !groupDetails) return;
                        try {
                          await handleRenameGroup(groupDetails._id, renameGroupName.trim());
                          setShowRenameGroupModal(false);
                        } catch (error) {
                          console.error('Error renaming group:', error);
                        }
                      }}
                      authUserId={auth.user._id}
                    />
                  </>
                )}
                {!selectedUser && !selectedGroup && (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100" style={{ minHeight: '400px' }}>
                    <i className="ki-duotone ki-message-text-2 fs-5tx text-primary mb-5">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <h3 className="text-gray-800 mb-2">Select a chat to start messaging</h3>
                    <div className="text-muted">Choose from your contacts list to start a conversation</div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow-1 d-flex align-items-center justify-content-center min-h-400px">
            <div className="text-center w-100">
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
    </div>
  );
};

export default Chat; 