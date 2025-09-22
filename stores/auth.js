import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const users = ref([])
  const profile = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  
  // Check if current user is an admin
  const isAdmin = computed(() => {
    if (!user.value) return false
    // Check if user has admin role in their user_metadata
    if (user.value.user_metadata?.role === 'admin') return true
    // Check if user has is_admin flag in their profile
    return profile.value?.is_admin === 1 || profile.value?.is_admin === true
  })

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user.value) return
    
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore not found
      
      profile.value = data || {
        first_name: '',
        last_name: '',
        middle_name: '',
        school_number: ''
      }
      
      return { data: profile.value, error: null }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user.value) return { data: null, error: 'Not authenticated' }
    
    try {
      loading.value = true
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      let result, error
      
      if (existingProfile) {
        // Update existing profile
        const { data, error: updateError } = await supabase
          .from('user_profile')
          .update(updates)
          .eq('user_id', user.value.id)
          .select()
          .single()
        
        result = data
        error = updateError
      } else {
        // Create new profile
        const { data, error: createError } = await supabase
          .from('user_profile')
          .insert([
            {
              user_id: user.value.id,
              ...updates
            }
          ])
          .select()
          .single()
        
        result = data
        error = createError
      }

      if (error) throw error
      
      // Update local profile data
      profile.value = { ...profile.value, ...updates }
      
      return { data: result, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }
  // Upload avatar and update profile
  const uploadAvatar = async (file) => {
    if (!user.value) return { data: null, error: 'Not authenticated' }

    try {
      loading.value = true

      // Create a unique file path (user-id + filename)
      const filePath = `assets/${user.value.id}-${Date.now()}-${file.name}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('assets') // bucket name in Supabase
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      // Save URL to profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profile')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      profile.value = { ...profile.value, avatar_url: publicUrl }

      return { data: updatedProfile, error: null }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
  
      if (signUpError) throw signUpError
  
      return { data: signUpData, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      await navigateTo('/auth/login')
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Watch for auth state changes to update profile
  watch(user, (newUser) => {
    if (newUser) {
      fetchProfile()
    } else {
      profile.value = null
    }
  }, { immediate: true })

  const fetchAllUsers = async () => {
    try {
      loading.value = true
      
      // Get user profiles with auth data
      const { data: profiles, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data
      const formattedUsers = profiles.map(profile => ({
        ...profile,
        email: profile.auth_users?.email || 'No email',
        last_sign_in: profile.auth_users?.last_sign_in_at,
        created_at: profile.created_at
      }))
      
      users.value = formattedUsers
      return { data: formattedUsers, error: null }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    users,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signOut,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    fetchAllUsers
  }
})
