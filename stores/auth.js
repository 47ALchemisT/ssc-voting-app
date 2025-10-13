import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const users = ref([])
  const profile = ref(null)
  const loading = ref(false)
  const hasCompletedProfile = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  
  // Check if current user is an admin
  const isAdmin = computed(() => {
    if (!user.value) return false
    if (user.value.user_metadata?.role === 'admin') return true
    // Check if user has is_admin flag in their profile
    return profile.value?.is_admin === 1 || profile.value?.is_admin === true
  })

  const isCandidate = computed(() => {
    if (!user.value) return false
    return profile.value?.is_admin === 2 || profile.value?.is_admin === true
  })

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user.value) return
    
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('user_profile')
        .select('*, colleges(*)')
        .eq('user_id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore not found
      
      profile.value = data || {
        first_name: '',
        last_name: '',
        middle_name: '',
        school_number: '',
        college_id: null
      }
      
      // Check if profile is complete
      if (profile.value) {
        hasCompletedProfile.value = Boolean(
          profile.value.first_name &&
          profile.value.last_name &&
          profile.value.school_number
        )
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
      const updatedProfile = { ...profile.value, ...updates }
      profile.value = updatedProfile
      
      // Check if profile is complete after update
      hasCompletedProfile.value = Boolean(
        updatedProfile.first_name &&
        updatedProfile.last_name &&
        updatedProfile.school_number
      )
      
      return { data: updatedProfile, error: null }
      
      return { data: result, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }
  // Get all colleges for dropdown
  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, college_name')
        .order('college_name', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching colleges:', error)
      return { data: null, error }
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
        .select('*, colleges(college_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data
      const formattedUsers = profiles.map(profile => ({
        ...profile,
        college_name: profile.colleges?.college_name || 'No college',
        email: profile.email || 'No email', // This will be populated from the user object
        last_sign_in: profile.last_sign_in_at,
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

  const deactivateUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profile')
        .update({ status: 0 })
        .eq('user_id', userId)
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const activateUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profile')
        .update({ status: 1 })
        .eq('user_id', userId)
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user.value) {
        return { error: 'No user is currently logged in' };
      }

      // First, re-authenticate the user with their current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.value.email,
        password: currentPassword
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          return { error: 'Current password is incorrect' };
        }
        throw authError;
      }

      // If re-authentication is successful, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      return { error: null, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { 
        error: error.message || 'Failed to change password. Please try again.' 
      };
    }
  }

  const checkInactiveStatus = async () => {
    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!authUser) return { isInactive: false, error: 'No authenticated user' }

      // Check user profile status
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('status')
        .eq('user_id', authUser.id)
        .single()
      
      if (profileError) throw profileError
      
      return { 
        isInactive: userProfile.status === 0,
        error: null
      }
    } catch (error) {
      console.error('Error checking inactive status:', error)
      return { 
        isInactive: false,
        error: error.message || 'Failed to check user status' 
      }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      loading.value = true;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { data: null, error };
    } finally {
      loading.value = false;
    }
  };

  const signUpWithGoogle = async () => {
    try {
      loading.value = true;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign-up error:', error);
      return { data: null, error };
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    users,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isCandidate,
    hasCompletedProfile,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    fetchColleges,
    fetchAllUsers,
    signUp,
    signIn,
    signOut,
    deactivateUser,
    checkInactiveStatus,
    changePassword,
    activateUser,
    signInWithGoogle,
    signUpWithGoogle
  }
})
