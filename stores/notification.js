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

      // Then fetch notifications for this profile
      const { data, error: err } = await supabase
        .from('notification')
        .select('*')
        .eq('to', profile.id)  // Use the profile ID to match the 'to' field
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

      notifications.value.unshift(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error creating notification:', err)
      error.value = err.message
      return { data: null, error: err.message }
    }
  }

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

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    clearError,
    fetchMyNotifications
  }
})

export default useNotificationStore
