// stores/candidacy_application.js
import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { ref } from 'vue'

export const useCandidacyApplicationStore = defineStore('candidacyApplications', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const applications = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Helper to clear error after successful operations
  const clearError = () => {
    error.value = null
  }

  // Fetch all candidacy applications
  const fetchApplications = async () => {
    loading.value = true
    clearError()
    
    try {
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      
      applications.value = data || []
      return { data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching candidacy applications:', err)
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Submit a new candidacy application
  const submitApplication = async (electionId, positionId, platform) => {
    clearError()
    
    try {
      // Validate input
      if (!electionId || !positionId) {
        throw new Error('Election ID and position are required')
      }
      
      // Check if user is authenticated
      if (!user.value?.id) {
        throw new Error('User must be logged in to submit an application')
      }
      
      // Verify the position exists
      const { data: position, error: positionError } = await supabase
        .from('positions')
        .select('id')
        .eq('id', positionId)
        .single()
      
      if (positionError || !position) {
        throw new Error('Invalid position selected')
      }
      
      // Get the user's profile to get the numeric ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', user.value.id)
        .single()
      
      if (profileError) throw profileError
      if (!userProfile) throw new Error('User profile not found')
      
      // Check if user has already applied for this position in the election
      const { data: existingApplication, error: checkError } = await hasUserApplied(electionId, positionId)
      if (checkError) throw checkError
      if (existingApplication) {
        throw new Error('You have already applied for this position in the selected election')
      }
      
      // Create the application
      const { data, error: createError } = await supabase
        .from('candidacy_application')
        .insert([
          {
            user_id: userProfile.id,
            election_id: electionId,
            position_id: positionId, // Store the position ID reference
            platform: platform || null,
            status: STATUS.PENDING
          }
        ])
        .select(`
          *,
          position:position_id(*)
        `)
      
      if (createError) throw createError
      
      // Add to local state with position data
      if (data?.[0]) {
        applications.value = [data[0], ...applications.value]
      }
      
      return { data: data?.[0], error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error submitting application:', err)
      return { data: null, error: err.message }
    }
  }

  // Get application by ID
  const getApplicationById = async (id) => {
    clearError()
    
    try {
      if (!id) {
        throw new Error('Application ID is required')
      }
      
      const { data, error } = await supabase
        .from('candidacy_application')
        .select(`
          *,
          election:elections(*),
          position:position_id(*),
          user:user_profile(*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching application:', err)
      return { data: null, error: err.message }
    }
  }

  
  // Status constants for better readability
  const STATUS = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
  }


  // Get applications by election ID with optional status filter
  const getApplicationsByElection = async (electionId, status = null) => {
    clearError()
    
    try {
      let query = supabase
        .from('candidacy_application')
        .select(`
          *,
          user:user_profile(*),
          position:positions(*)
        `)
        .eq('election_id', electionId)
        .order('created_at', { ascending: false })
      
      if (status !== null) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return { data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching applications by election:', err)
      return { data: null, error: err.message }
    }
  }

  // Get applications by user
  const getUserApplications = async (userId = null) => {
    clearError()
    
    const targetUserId = userId || user.value?.id
    if (!targetUserId) {
      return { data: null, error: 'User ID is required' }
    }
    
    try {
      // First, get the user's profile to get the numeric ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', targetUserId)
        .single()
      
      if (profileError) throw profileError
      if (!userProfile) return { data: [], error: 'User profile not found' }
      
      // Then get the applications using the numeric ID
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select(`
          *,
          election:elections(*),
          user:user_profile(*)
        `)
        .eq('user_id', userProfile.id)
        .order('applied_at', { ascending: false })

      if (err) throw err
      
      return { data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching applications by candidate:', err)
      return { data: null, error: err.message }
    }
  }

  // Check if user has already applied for a position in an election
  const hasUserApplied = async (electionId, position) => {
    clearError()
    
    if (!user.value?.id) {
      return { data: false, error: 'User not authenticated' }
    }
    
    try {
      // First, get the user's profile to get the numeric ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', user.value.id)
        .single()
      
      if (profileError) throw profileError
      if (!userProfile) return { data: false, error: 'User profile not found' }
      
      // Then check for existing application
      // Note: We only check for pending or approved applications (status 0 or 1)
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select('id, status')
        .eq('user_id', userProfile.id)
        .eq('election_id', electionId)
        .eq('position_id', position)
        .in('status', [0, 1]) // 0 = pending, 1 = approved
        .maybeSingle()

      if (err) throw err
      
      return { data: !!data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error checking user application:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    // State
    applications,
    loading,
    error,
    
    // Constants
    STATUS,
    statuses: () => STATUS,
    
    // Getters
    getApplicationById: (id) => applications.value.find(app => app.id === id),
    getApplicationsByElectionId: (electionId) => 
      applications.value.filter(app => app.election_id === electionId),
    
    // Actions
    fetchApplications,
    submitApplication,
    getApplicationById,
    getApplicationsByElection,
    updateApplicationStatus: async (id, status) => {
      clearError()
      
      try {
        // Convert status string to corresponding numeric value if needed
        const statusValue = typeof status === 'string' 
          ? STATUS[status.toUpperCase()] 
          : status;
            
        const { data, error: err } = await supabase
          .from('candidacy_application')
          .update({ 
            status: statusValue,
            // Removed updated_at as it's not in the schema
          })
          .eq('id', id)
          .select()

        if (err) throw err
        
        // Update local state if needed
        const index = applications.value.findIndex(app => app.id === id);
        if (index !== -1) {
          applications.value[index] = { ...applications.value[index], status: statusValue };
        }
        
        return { data, error: null }
      } catch (err) {
        error.value = err.message
        console.error('Error updating application status:', err)
        return { data: null, error: err.message }
      }
    },
    getUserApplications,
    hasUserApplied,
    clearError
  }
})

export default useCandidacyApplicationStore
