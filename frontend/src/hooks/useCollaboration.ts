import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export interface CollaborationUser {
  userId: string;
  userName: string;
  cursor?: { x: number; y: number };
  selectedComponent?: string;
}

export interface CollaborationMessage {
  type: 'system_update' | 'cursor_move' | 'component_select' | 'user_join' | 'user_leave' | 'chat_message' | 'room_joined';
  systemId: string;
  userId: string;
  userName?: string;
  data?: any;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export const useCollaboration = (systemId: string | null) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  // Callbacks for external components
  const onSystemUpdateRef = useRef<((data: any) => void) | null>(null);
  const onCursorMoveRef = useRef<((userId: string, cursor: { x: number; y: number }) => void) | null>(null);
  const onComponentSelectRef = useRef<((userId: string, componentId: string) => void) | null>(null);

  const connect = useCallback(() => {
    if (!systemId || !isAuthenticated || !user) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        // Join the collaboration room
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'user_join',
            systemId,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            timestamp: new Date().toISOString()
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setActiveUsers([]);
        
        // Attempt to reconnect if not intentionally closed
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to connect to collaboration server');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  }, [systemId, isAuthenticated, user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Send leave message before closing
      if (wsRef.current.readyState === WebSocket.OPEN && systemId && user) {
        wsRef.current.send(JSON.stringify({
          type: 'user_leave',
          systemId,
          userId: user.id,
          timestamp: new Date().toISOString()
        }));
      }
      
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setActiveUsers([]);
    setConnectionError(null);
    reconnectAttemptsRef.current = 0;
  }, [systemId, user]);

  const handleMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'room_joined':
      case 'user_join':
      case 'user_leave':
        if (message.data?.activeUsers) {
          setActiveUsers(message.data.activeUsers);
        }
        break;

      case 'system_update':
        if (onSystemUpdateRef.current && message.userId !== user?.id) {
          onSystemUpdateRef.current(message.data);
        }
        break;

      case 'cursor_move':
        if (onCursorMoveRef.current && message.userId !== user?.id) {
          onCursorMoveRef.current(message.userId, message.data.cursor);
        }
        break;

      case 'component_select':
        if (onComponentSelectRef.current && message.userId !== user?.id) {
          onComponentSelectRef.current(message.userId, message.data.componentId);
        }
        break;

      case 'chat_message':
        const chatMessage: ChatMessage = {
          id: `${message.userId}-${message.timestamp}`,
          userId: message.userId,
          userName: message.data.userName,
          message: message.data.message,
          timestamp: message.timestamp
        };
        setChatMessages(prev => [...prev, chatMessage]);
        break;

      default:
        console.log('Unknown collaboration message type:', message.type);
    }
  }, [user?.id]);

  // Public methods for sending messages
  const sendSystemUpdate = useCallback((components: any[], connections: any[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && systemId && user) {
      wsRef.current.send(JSON.stringify({
        type: 'system_update',
        systemId,
        userId: user.id,
        data: { components, connections },
        timestamp: new Date().toISOString()
      }));
    }
  }, [systemId, user]);

  const sendCursorMove = useCallback((cursor: { x: number; y: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && systemId && user) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        systemId,
        userId: user.id,
        data: { cursor },
        timestamp: new Date().toISOString()
      }));
    }
  }, [systemId, user]);

  const sendComponentSelect = useCallback((componentId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && systemId && user) {
      wsRef.current.send(JSON.stringify({
        type: 'component_select',
        systemId,
        userId: user.id,
        data: { componentId },
        timestamp: new Date().toISOString()
      }));
    }
  }, [systemId, user]);

  const sendChatMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && systemId && user) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        systemId,
        userId: user.id,
        data: { 
          message,
          userName: `${user.firstName} ${user.lastName}`
        },
        timestamp: new Date().toISOString()
      }));
    }
  }, [systemId, user]);

  // Callback setters
  const setOnSystemUpdate = useCallback((callback: (data: any) => void) => {
    onSystemUpdateRef.current = callback;
  }, []);

  const setOnCursorMove = useCallback((callback: (userId: string, cursor: { x: number; y: number }) => void) => {
    onCursorMoveRef.current = callback;
  }, []);

  const setOnComponentSelect = useCallback((callback: (userId: string, componentId: string) => void) => {
    onComponentSelectRef.current = callback;
  }, []);

  // Auto-connect when systemId changes
  useEffect(() => {
    if (systemId && isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [systemId, isAuthenticated, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    connectionError,
    activeUsers,
    
    // Chat
    chatMessages,
    sendChatMessage,
    clearChatMessages: () => setChatMessages([]),
    
    // Collaboration actions
    sendSystemUpdate,
    sendCursorMove,
    sendComponentSelect,
    
    // Event handlers
    setOnSystemUpdate,
    setOnCursorMove,
    setOnComponentSelect,
    
    // Connection control
    connect,
    disconnect,
    
    // Utility
    isUserActive: (userId: string) => activeUsers.some(u => u.userId === userId),
    getUserCursor: (userId: string) => activeUsers.find(u => u.userId === userId)?.cursor,
    getUserSelection: (userId: string) => activeUsers.find(u => u.userId === userId)?.selectedComponent
  };
};