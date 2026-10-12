/**
 * Real-time messaging service using Supabase Realtime subscriptions
 * Provides instant message updates across all dashboards without page reload
 * Messages persist in database and reload like WhatsApp
 */
import { supabase } from '@/lib/supabase'
import { Message, Notification, Connection } from '@/lib/supabaseEntities'

class RealtimeMessagingService {
  constructor() {
    this.subscriptions = new Map()
    this.listeners = new Map()
  }

  /**
   * Subscribe to messages for a specific user
   * @param {string} userId - User's ID to subscribe to messages for
   * @param {Function} onMessageReceived - Callback when new message is received
   * @param {Function} onMessageUpdated - Callback when message is updated (read status, etc.)
   * @returns {Function} Unsubscribe function
   */
  subscribeToMessages(userId, onMessageReceived, onMessageUpdated) {
    const channelName = `messages:${userId}`

    // Clean up existing subscription if any
    this.unsubscribeFromMessages(userId)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (onMessageReceived) {
            onMessageReceived(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`,
        },
        (payload) => {
          if (onMessageReceived) {
            onMessageReceived(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (onMessageUpdated) {
            onMessageUpdated(payload.new)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Subscription successful
        } else if (status === 'CHANNEL_ERROR') {
          // Handle error
        }
      })

    this.subscriptions.set(userId, channel)
    this.listeners.set(userId, { onMessageReceived, onMessageUpdated })

    // Return unsubscribe function
    return () => this.unsubscribeFromMessages(userId)
  }

  /**
   * Unsubscribe from messages for a specific user
   * @param {string} userId - User's ID to unsubscribe from
   */
  unsubscribeFromMessages(userId) {
    const channel = this.subscriptions.get(userId)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(userId)
      this.listeners.delete(userId)
    }
  }

  /**
   * Send a message (persists to database)
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(messageData) {
    try {
      const message = await Message.create({
        ...messageData,
        created_at: new Date().toISOString(),
        read_at: null,
      })
      return message
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async markAsRead(messageId) {
    try {
      const message = await Message.update(messageId, {
        read_at: new Date().toISOString(),
      })
      return message
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`)
    }
  }

  /**
   * Get conversation history between two users
   * @param {string} userId1 - First user's ID
   * @param {string} userId2 - Second user's ID
   * @returns {Promise<Array>} Conversation messages
   */
  async getConversation(userId1, userId2) {
    try {
      const messages = await Message.filter({
        or: `and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`
      }, 'created_at', 100)
      return messages || []
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`)
    }
  }

  /**
   * Get all messages for a user
   * @param {string} userId - User's ID
   * @returns {Promise<Array>} User's messages
   */
  async getUserMessages(userId) {
    try {
      const messages = await Message.filter({
        or: `sender_id.eq.${userId},recipient_id.eq.${userId}`
      }, 'created_at', 100)
      return messages || []
    } catch (error) {
      throw new Error(`Failed to get user messages: ${error.message}`)
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
    this.listeners.clear()
  }

  /**
   * Subscribe to notifications for a specific user
   * @param {string} userId - User's ID to subscribe to notifications for
   * @param {Function} onNotification - Callback when new notification is received
   * @returns {Function} Unsubscribe function
   */
  subscribeToNotifications(userId, onNotification) {
    const channelName = `notifications:${userId}`

    // Clean up existing subscription if any
    this.unsubscribeFromNotifications(userId)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (onNotification) {
            onNotification(payload.new)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Subscription successful
        }
      })

    this.subscriptions.set(`notifications:${userId}`, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromNotifications(userId)
  }

  /**
   * Unsubscribe from notifications for a specific user
   * @param {string} userId - User's ID to unsubscribe from
   */
  unsubscribeFromNotifications(userId) {
    const channel = this.subscriptions.get(`notifications:${userId}`)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(`notifications:${userId}`)
    }
  }

  /**
   * Subscribe to connection requests for a specific user
   * @param {string} userId - User's ID to subscribe to connection requests for
   * @param {Function} onConnectionRequest - Callback when new connection request is received
   * @returns {Function} Unsubscribe function
   */
  subscribeToConnections(userId, onConnectionRequest) {
    const channelName = `connections:${userId}`

    // Clean up existing subscription if any
    this.unsubscribeFromConnections(userId)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (onConnectionRequest) {
            onConnectionRequest(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (onConnectionRequest) {
            onConnectionRequest(payload.new)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Subscription successful
        }
      })

    this.subscriptions.set(`connections:${userId}`, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromConnections(userId)
  }

  /**
   * Unsubscribe from connection requests for a specific user
   * @param {string} userId - User's ID to unsubscribe from
   */
  unsubscribeFromConnections(userId) {
    const channel = this.subscriptions.get(`connections:${userId}`)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(`connections:${userId}`)
    }
  }
}

// Singleton instance
const realtimeMessagingService = new RealtimeMessagingService()

export default realtimeMessagingService
