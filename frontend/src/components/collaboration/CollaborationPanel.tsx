import React, { useState, useRef, useEffect } from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useCollaboration, CollaborationUser, ChatMessage } from '../../hooks/useCollaboration';

interface CollaborationPanelProps {
  systemId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  systemId,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('users');
  const [chatMessage, setChatMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    connectionError,
    activeUsers,
    chatMessages,
    sendChatMessage,
    clearChatMessages
  } = useCollaboration(systemId);

  const iconStyle = { width: '1rem', height: '1rem', maxWidth: '1rem', maxHeight: '1rem' };
  const largeIconStyle = { width: '1.25rem', height: '1.25rem', maxWidth: '1.25rem', maxHeight: '1.25rem' };

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (chatMessage.trim() && isConnected) {
      sendChatMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserColor = (userId: string) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '50%',
          right: '1rem',
          transform: 'translateY(-50%)',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.15s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <UsersIcon style={iconStyle} />
        {activeUsers.length > 0 && (
          <span style={{
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '50%',
            width: '1.25rem',
            height: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {activeUsers.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '320px',
      height: '100vh',
      backgroundColor: 'white',
      borderLeft: '1px solid #e5e7eb',
      boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: 0
          }}>
            Collaboration
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            backgroundColor: isConnected ? '#d1fae5' : connectionError ? '#fef2f2' : '#f3f4f6',
            color: isConnected ? '#065f46' : connectionError ? '#dc2626' : '#6b7280',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {isConnected ? (
              <>
                <WifiIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                Connected
              </>
            ) : connectionError ? (
              <>
                <ExclamationTriangleIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                Error
              </>
            ) : (
              <>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  border: '2px solid #d1d5db',
                  borderTop: '2px solid #6b7280',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Connecting
              </>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            transition: 'all 0.15s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          <XMarkIcon style={largeIconStyle} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: activeTab === 'users' ? '#f9fafb' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: activeTab === 'users' ? '#3b82f6' : '#6b7280',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <UsersIcon style={iconStyle} />
          Users ({activeUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: activeTab === 'chat' ? '#f9fafb' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: activeTab === 'chat' ? '#3b82f6' : '#6b7280',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <ChatBubbleLeftRightIcon style={iconStyle} />
          Chat
          {chatMessages.length > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '1rem',
              height: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              fontWeight: 'bold'
            }}>
              {chatMessages.length > 99 ? '99+' : chatMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'users' ? (
          <div style={{ padding: '1rem', overflow: 'auto' }}>
            {!isConnected && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <UsersIcon style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  margin: '0 auto 1rem',
                  color: '#d1d5db'
                }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  {connectionError ? 'Connection failed' : 'Connecting to collaboration server...'}
                </p>
              </div>
            )}
            
            {isConnected && activeUsers.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <UsersIcon style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  margin: '0 auto 1rem',
                  color: '#d1d5db'
                }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  No other users online
                </p>
              </div>
            )}

            {activeUsers.map((user) => (
              <div
                key={user.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb',
                  marginBottom: '0.5rem'
                }}
              >
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    backgroundColor: getUserColor(user.userId),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {user.userName}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {user.selectedComponent ? `Editing ${user.selectedComponent}` : 'Online'}
                  </p>
                </div>
                <div
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                padding: '1rem',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <ChatBubbleLeftRightIcon style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    margin: '0 auto 1rem',
                    color: '#d1d5db'
                  }} />
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        backgroundColor: getUserColor(message.userId),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}
                    >
                      {message.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          {message.userName}
                        </span>
                        <span style={{
                          fontSize: '0.625rem',
                          color: '#9ca3af'
                        }}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#1f2937',
                        margin: 0,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-end'
              }}>
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type a message..." : "Connect to chat"}
                  disabled={!isConnected}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'none',
                    minHeight: '2.5rem',
                    maxHeight: '6rem',
                    outline: 'none',
                    backgroundColor: isConnected ? 'white' : '#f3f4f6',
                    color: isConnected ? '#1f2937' : '#9ca3af'
                  }}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || !isConnected}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: (!chatMessage.trim() || !isConnected) ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: (!chatMessage.trim() || !isConnected) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (chatMessage.trim() && isConnected) {
                      e.target.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (chatMessage.trim() && isConnected) {
                      e.target.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  <PaperAirplaneIcon style={iconStyle} />
                </button>
              </div>
              {chatMessages.length > 0 && (
                <button
                  onClick={clearChatMessages}
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear chat history
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;