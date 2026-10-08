/**
 * Real-time messaging service using Supabase Realtime subscriptions
 * Provides instant message updates across all dashboards without page reload
 */
import { supabase } from '@/lib/supabase'

class RealtimeMessagingService {
  constructor() {
    this.subscriptions = new Map()
    this.listeners = new Map()
  }

  /**
   * Subscribe to messages for a specific user
   * @param {string} userEmail - User's email to subscribe to messages for
   * @param {Function} onMessageReceived - Callback when new message is received
   * @param {Function} onMessageUpdated - Callback when message is updated (read status, etc.)
   * @returns {Function} Unsubscribe function
   */
  subscribeToMessages(userEmail, onMessageReceived, onMessageUpdated) {
    const channelName = `messages:${userEmail}`

    // Clean up existing subscription if any
    this.unsubscribeFromMessages(userEmail)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_email=eq.${userEmail}`,
        },
        (payload) => {
          //
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
          filter: `sender_email=eq.${userEmail}`,
        },
        (payload) => {
          //
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
          filter: `recipient_email=eq.${userEmail}`,
        },
        (payload) => {
          //
          if (onMessageUpdated) {
            onMessageUpdated(payload.new)
          }
        }
      )
      .subscribe((status) => {
        //
        if (status === 'SUBSCRIBED') {
          //
        } else if (status === 'CHANNEL_ERROR') {
          //
        }
      })

    this.subscriptions.set(userEmail, channel)
    this.listeners.set(userEmail, { onMessageReceived, onMessageUpdated })

    // Return unsubscribe function
    return () => this.unsubscribeFromMessages(userEmail)
  }

  /**
   * Unsubscribe from messages for a specific user
   * @param {string} userEmail - User's email to unsubscribe from
   */
  unsubscribeFromMessages(userEmail) {
    const channel = this.subscriptions.get(userEmail)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(userEmail)
      this.listeners.delete(userEmail)
      //
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel, userEmail) => {
      supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
    this.listeners.clear()
    //
  }

  /**
   * Subscribe to notifications for a specific user
   * @param {string} userEmail - User's email to subscribe to notifications for
   * @param {Function} onNotification - Callback when new notification is received
   * @returns {Function} Unsubscribe function
   */
  subscribeToNotifications(userEmail, onNotification) {
    const channelName = `notifications:${userEmail}`

    // Clean up existing subscription if any
    this.unsubscribeFromNotifications(userEmail)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_email=eq.${userEmail}`,
        },
        (payload) => {
          //
          if (onNotification) {
            onNotification(payload.new)
          }
        }
      )
      .subscribe((status) => {
        //
      })

    this.subscriptions.set(`notifications:${userEmail}`, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromNotifications(userEmail)
  }

  /**
   * Unsubscribe from notifications for a specific user
   * @param {string} userEmail - User's email to unsubscribe from
   */
  unsubscribeFromNotifications(userEmail) {
    const channel = this.subscriptions.get(`notifications:${userEmail}`)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(`notifications:${userEmail}`)
      //
    }
  }

  /**
   * Subscribe to connection requests for a specific user
   * @param {string} userEmail - User's email to subscribe to connection requests for
   * @param {Function} onConnectionRequest - Callback when new connection request is received
   * @returns {Function} Unsubscribe function
   */
  subscribeToConnections(userEmail, onConnectionRequest) {
    const channelName = `connections:${userEmail}`

    // Clean up existing subscription if any
    this.unsubscribeFromConnections(userEmail)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_email=eq.${userEmail}`,
        },
        (payload) => {
          //
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
          filter: `recipient_email=eq.${userEmail}`,
        },
        (payload) => {
          //
          if (onConnectionRequest) {
            onConnectionRequest(payload.new)
          }
        }
      )
      .subscribe((status) => {
        //
      })

    this.subscriptions.set(`connections:${userEmail}`, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromConnections(userEmail)
  }

  /**
   * Unsubscribe from connection requests for a specific user
   * @param {string} userEmail - User's email to unsubscribe from
   */
  unsubscribeFromConnections(userEmail) {
    const channel = this.subscriptions.get(`connections:${userEmail}`)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(`connections:${userEmail}`)
      //
    }
  }
}

// Singleton instance
const realtimeMessagingService = new RealtimeMessagingService()

export default realtimeMessagingService
