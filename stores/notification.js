import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  const clearError = () => { error.value = null }

  // Fetch notifications for the logged-in user
  const fetchNotifications = async () => {
    if (!user.value?.id) return { data: [], error: 'User not logged in' }

    loading.value = true
    clearError()

    try {
      // First, get numeric ID from user_profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (profileError) throw profileError

      const { data, error: err } = await supabase
        .from('notification')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (err) throw err

      notifications.value = data || []
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      error.value = err.message
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchMyNotifications = async () => {
    if (!user.value?.id) return { data: [], error: 'User not logged in' }

    loading.value = true
    clearError()

    try {
      // First, get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (profileError) throw profileError
      if (!profile) throw new Error('User profile not found')

      // Fetch notifications where:
      // 1. The 'to' field matches the current user's profile ID (for direct notifications)
      // 2. The 'to' field matches the admin's profile ID (for application notifications)
      const { data, error: err } = await supabase
        .from('notification')
        .select('*')
        .eq('to', profile.id)  // Direct notifications to this profile
        .order('created_at', { ascending: false })

      if (err) throw err

      notifications.value = data || []
      return { data, error: null }
    } catch (err) {
      console.error('Error in fetchMyNotifications:', err)
      error.value = err.message
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Create a new notification
  const createNotification = async ({ userId, title, message, type = 'general', link = null, SubjectTo }) => {
    clearError()

    try {
      if (!userId) throw new Error('userId is required')
      if (!title || !message) throw new Error('Title and message are required')

      const { data, error: err } = await supabase
        .from('notification')
        .insert([
          {
            user_id: userId,
            title,
            message,
            type,
            link,
            is_read: 0,
            to: SubjectTo
          }
        ])
        .select()
        .single()

      if (err) throw err

      // Only add to local state if this notification is for the current user
      if (data.to === user.value?.id) {
        notifications.value.unshift(data)
      }
      return { data, error: null }
    } catch (err) {
      console.error('Error creating notification:', err)
      error.value = err.message
      return { data: null, error: err.message }
    }
  }

  // Mark all unread notifications as read
  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications.value
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return { data: [], error: null };

      // Update all unread notifications in the database
      const { data, error: err } = await supabase
        .from('notification')
        .update({ is_read: 1 })
        .in('id', unreadIds)
        .select();

      if (err) throw err;

      // Update local state
      notifications.value = notifications.value.map(notification => 
        unreadIds.includes(notification.id) 
          ? { ...notification, is_read: 1 } 
          : notification
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error marking all as read:', err);
      error.value = err.message;
      return { data: null, error: err.message };
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    if (!id) return { data: null, error: 'Notification ID is required' }

    try {
      const { data, error: err } = await supabase
        .from('notification')
        .update({ is_read: 1 })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) notifications.value[index].is_read = 1

      return { data, error: null }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      error.value = err.message
      return { data: null, error: err.message }
    }
  }

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      loading.value = true;
      
      // Get all read notification IDs
      const readIds = notifications.value
        .filter(n => n.is_read)
        .map(n => n.id);

      if (readIds.length === 0) return { data: [], error: null };

      // Delete all read notifications from the database
      const { error: deleteError } = await supabase
        .from('notification')
        .delete()
        .in('id', readIds);

      if (deleteError) throw deleteError;

      // Update local state by removing deleted notifications
      notifications.value = notifications.value.filter(n => !n.is_read);

      return { data: readIds, error: null };
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      error.value = err.message;
      return { data: null, error: err.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteAllRead,
    clearError,
    fetchMyNotifications
  }
})

export default useNotificationStore
