import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../utils/logger';
import { database } from '../database/index';

export interface CollaborationMessage {
  type: 'system_update' | 'cursor_move' | 'component_select' | 'user_join' | 'user_leave' | 'chat_message';
  systemId: string;
  userId: string;
  userName?: string;
  data?: any;
  timestamp: string;
}

export interface CollaborationUser {
  userId: string;
  userName: string;
  ws: WebSocket;
  systemId: string;
  cursor?: { x: number; y: number };
  selectedComponent?: string;
}

export class CollaborationService {
  private rooms: Map<string, Set<CollaborationUser>> = new Map();
  private userSessions: Map<string, CollaborationUser> = new Map();

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      logger.info(`Collaboration WebSocket connection established`);

      ws.on('message', (message) => {
        try {
          const data: CollaborationMessage = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          logger.error('Invalid collaboration message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleUserDisconnect(ws);
      });

      ws.on('error', (error) => {
        logger.error('Collaboration WebSocket error:', error);
      });
    });
  }

  private async handleMessage(ws: WebSocket, message: CollaborationMessage) {
    switch (message.type) {
      case 'user_join':
        await this.handleUserJoin(ws, message);
        break;
      case 'user_leave':
        this.handleUserLeave(message);
        break;
      case 'system_update':
        await this.handleSystemUpdate(message);
        break;
      case 'cursor_move':
        this.handleCursorMove(message);
        break;
      case 'component_select':
        this.handleComponentSelect(message);
        break;
      case 'chat_message':
        this.handleChatMessage(message);
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private async handleUserJoin(ws: WebSocket, message: CollaborationMessage) {
    const { systemId, userId, userName } = message;

    // Verify user has access to the system
    const hasAccess = await this.verifySystemAccess(userId, systemId);
    if (!hasAccess) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Access denied to system'
      }));
      return;
    }

    // Create user session
    const user: CollaborationUser = {
      userId,
      userName: userName || 'Anonymous',
      ws,
      systemId
    };

    // Add user to room
    if (!this.rooms.has(systemId)) {
      this.rooms.set(systemId, new Set());
    }
    this.rooms.get(systemId)!.add(user);
    this.userSessions.set(userId, user);

    // Notify other users in the room
    this.broadcastToRoom(systemId, {
      type: 'user_join',
      systemId,
      userId,
      userName: user.userName,
      data: {
        activeUsers: Array.from(this.rooms.get(systemId)!).map(u => ({
          userId: u.userId,
          userName: u.userName,
          cursor: u.cursor,
          selectedComponent: u.selectedComponent
        }))
      },
      timestamp: new Date().toISOString()
    }, userId);

    // Send current room state to the new user
    ws.send(JSON.stringify({
      type: 'room_joined',
      systemId,
      data: {
        activeUsers: Array.from(this.rooms.get(systemId)!).map(u => ({
          userId: u.userId,
          userName: u.userName,
          cursor: u.cursor,
          selectedComponent: u.selectedComponent
        }))
      },
      timestamp: new Date().toISOString()
    }));

    logger.info(`User ${userName} (${userId}) joined collaboration room for system ${systemId}`);
  }

  private handleUserLeave(message: CollaborationMessage) {
    const { systemId, userId } = message;
    
    this.removeUserFromRoom(userId, systemId);
    
    // Notify other users
    this.broadcastToRoom(systemId, {
      type: 'user_leave',
      systemId,
      userId,
      data: {
        activeUsers: this.rooms.get(systemId) ? 
          Array.from(this.rooms.get(systemId)!).map(u => ({
            userId: u.userId,
            userName: u.userName,
            cursor: u.cursor,
            selectedComponent: u.selectedComponent
          })) : []
      },
      timestamp: new Date().toISOString()
    }, userId);
  }

  private async handleSystemUpdate(message: CollaborationMessage) {
    const { systemId, userId, data } = message;

    // Save system update to database
    try {
      const updateStmt = database.prepare(`
        UPDATE systems 
        SET components = ?, connections = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND (user_id = ? OR id IN (
          SELECT system_id FROM project_collaborators 
          WHERE user_id = ? AND role IN ('owner', 'admin', 'collaborator')
        ))
      `);
      
      updateStmt.run(
        JSON.stringify(data.components || []),
        JSON.stringify(data.connections || []),
        systemId,
        userId,
        userId
      );

      // Broadcast update to all users in the room
      this.broadcastToRoom(systemId, {
        type: 'system_update',
        systemId,
        userId,
        data,
        timestamp: new Date().toISOString()
      }, userId);

      logger.info(`System ${systemId} updated by user ${userId}`);
    } catch (error) {
      logger.error('Failed to save system update:', error);
    }
  }

  private handleCursorMove(message: CollaborationMessage) {
    const { systemId, userId, data } = message;
    
    // Update user cursor position
    const user = this.userSessions.get(userId);
    if (user) {
      user.cursor = data.cursor;
    }

    // Broadcast cursor position to other users
    this.broadcastToRoom(systemId, {
      type: 'cursor_move',
      systemId,
      userId,
      data: {
        cursor: data.cursor
      },
      timestamp: new Date().toISOString()
    }, userId);
  }

  private handleComponentSelect(message: CollaborationMessage) {
    const { systemId, userId, data } = message;
    
    // Update user selected component
    const user = this.userSessions.get(userId);
    if (user) {
      user.selectedComponent = data.componentId;
    }

    // Broadcast selection to other users
    this.broadcastToRoom(systemId, {
      type: 'component_select',
      systemId,
      userId,
      data: {
        componentId: data.componentId
      },
      timestamp: new Date().toISOString()
    }, userId);
  }

  private handleChatMessage(message: CollaborationMessage) {
    const { systemId, userId, data } = message;

    // Broadcast chat message to all users in the room
    this.broadcastToRoom(systemId, {
      type: 'chat_message',
      systemId,
      userId,
      data: {
        message: data.message,
        userName: data.userName
      },
      timestamp: new Date().toISOString()
    });

    logger.info(`Chat message in system ${systemId} from user ${userId}`);
  }

  private handleUserDisconnect(ws: WebSocket) {
    // Find and remove user from all rooms
    for (const [userId, user] of this.userSessions.entries()) {
      if (user.ws === ws) {
        this.removeUserFromRoom(userId, user.systemId);
        
        // Notify other users
        this.broadcastToRoom(user.systemId, {
          type: 'user_leave',
          systemId: user.systemId,
          userId,
          data: {
            activeUsers: this.rooms.get(user.systemId) ? 
              Array.from(this.rooms.get(user.systemId)!).map(u => ({
                userId: u.userId,
                userName: u.userName,
                cursor: u.cursor,
                selectedComponent: u.selectedComponent
              })) : []
          },
          timestamp: new Date().toISOString()
        }, userId);
        
        break;
      }
    }
  }

  private removeUserFromRoom(userId: string, systemId: string) {
    const room = this.rooms.get(systemId);
    if (room) {
      const user = this.userSessions.get(userId);
      if (user) {
        room.delete(user);
        this.userSessions.delete(userId);
        
        // Clean up empty rooms
        if (room.size === 0) {
          this.rooms.delete(systemId);
        }
      }
    }
  }

  private broadcastToRoom(systemId: string, message: CollaborationMessage, excludeUserId?: string) {
    const room = this.rooms.get(systemId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    
    for (const user of room) {
      if (excludeUserId && user.userId === excludeUserId) continue;
      
      try {
        if (user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(messageStr);
        }
      } catch (error) {
        logger.error(`Failed to send message to user ${user.userId}:`, error);
      }
    }
  }

  private async verifySystemAccess(userId: string, systemId: string): Promise<boolean> {
    try {
      const stmt = database.prepare(`
        SELECT 1 FROM systems 
        WHERE id = ? AND (
          user_id = ? OR 
          visibility = 'public' OR
          id IN (
            SELECT system_id FROM project_collaborators 
            WHERE user_id = ?
          )
        )
      `);
      
      const result = stmt.get(systemId, userId, userId);
      return !!result;
    } catch (error) {
      logger.error('Failed to verify system access:', error);
      return false;
    }
  }

  // Public methods for external use
  public getRoomUsers(systemId: string): CollaborationUser[] {
    const room = this.rooms.get(systemId);
    return room ? Array.from(room) : [];
  }

  public getRoomCount(): number {
    return this.rooms.size;
  }

  public getTotalUsers(): number {
    return this.userSessions.size;
  }

  public getSystemStats(systemId: string) {
    const room = this.rooms.get(systemId);
    return {
      activeUsers: room ? room.size : 0,
      users: room ? Array.from(room).map(u => ({
        userId: u.userId,
        userName: u.userName,
        cursor: u.cursor,
        selectedComponent: u.selectedComponent
      })) : []
    };
  }
}