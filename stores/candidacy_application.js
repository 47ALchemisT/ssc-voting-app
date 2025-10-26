// stores/candidacy_application.js
import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useNotificationStore } from './notification'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useCandidacyApplicationStore = defineStore('candidacyApplications', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
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

  // Upload a file to storage
  const uploadFile = async (file, prefix) => {
    if (!file) return null
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${prefix}-${user.value.id}-${Date.now()}.${fileExt}`
    const filePath = `assets/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Submit a new candidacy application with file uploads
  const submitApplication = async (formData) => {
    clearError()
    loading.value = true
    
    try {
      // Validate required fields
      if (!formData.electionId || !formData.positionId) {
        throw new Error('Election and position are required')
      }

      if (!user.value?.id) {
        throw new Error('User must be logged in to submit an application')
      }

      // Get user profile to verify existence and get the numeric ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('id, first_name, last_name')
        .eq('user_id', user.value.id)
        .single()

      if (profileError || !userProfile) {
        throw new Error('User profile not found. Please complete your profile first.')
      }

      // Check for existing application for this position in the same election
      const { data: existingApplication, error: checkError } = await hasUserApplied(
        formData.electionId,
        formData.positionId
      )

      if (checkError) throw checkError
      if (existingApplication) {
        throw new Error('You have already applied for this position in the selected election')
      }

      // Upload all files in parallel
      const [
        gradeSlipUrl, 
        activityCertUrl, 
        candidacyCertUrl, 
        backSubRecordUrl, 
        corUrl
      ] = await Promise.all([
        uploadFile(formData.gradeSlip, 'gradeslip'),
        uploadFile(formData.activityCertificate, 'activity-cert'),
        uploadFile(formData.candidacyCertificate, 'candidacy-cert'),
        uploadFile(formData.backSubjectRecord, 'back-subject'),
        uploadFile(formData.cor, 'cor')
      ])
      
      // Create the application with file URLs
      const { data, error: createError } = await supabase
        .from('candidacy_application')
        .insert([
          {
            user_id: userProfile.id,
            election_id: formData.electionId,
            position_id: formData.positionId,
            partylists_id: formData.partylistId,
            platform: formData.platform || null,
            status: STATUS.PENDING,
            applied_at: new Date().toISOString(),
            grade_slip: gradeSlipUrl,
            certificate_activity: activityCertUrl,
            certificate_candidacy: candidacyCertUrl,
            back_sub_record: backSubRecordUrl,
            cor: corUrl
          }
        ])
        .select(`
          *,
          position:position_id(*)
        `)
        .single()
      
      if (createError) throw createError
      
      // Add to local state
      applications.value = [data, ...applications.value]

      // 🔔 CREATE NOTIFICATION
      try {
        // Fetch the admin user
        const { data: adminUser, error: adminError } = await supabase
          .from('user_profile')
          .select('id')
          .eq('is_admin', 1)
          .single();
        
        if (adminError) throw adminError;
        
        // Send notification to the admin
        await notificationStore.createNotification({
          userId: userProfile.id,
          title: 'New Candidacy Application',
          message: `A new application for ${data.position.name} has been submitted and is pending your approval.`,
          type: 'candidacy_application',
          link: null, // Make sure this route exists
          created_at: new Date().toISOString(),
          SubjectTo: adminUser.id
        });
      } catch (notifError) {
        console.warn('Notification creation failed:', notifError)
        // Don’t block the app if notification fails
      }

      return { data, error: null }

    } catch (err) {
      console.error('Error submitting application:', err)
      error.value = err.message
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }


  const cancelApplication = async (id) => {
    clearError()
    
    try {
      if (!id) {
        throw new Error('Application ID is required')
      }
      
      const { data, error } = await supabase
        .from('candidacy_application')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Remove from local state
      applications.value = applications.value.filter(app => app.id !== id)
      
      return { data, error: null }
    } catch (err) {
      error.value = err.message
      console.error('Error canceling application:', err)
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
          user:user_profile(*),
          partylists:partylists_id(*)
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
    REJECTED: 2,
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
          position:positions(*),
          partylists:partylists_id(*)
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
      
      // First, get the current active election
      const { data: activeElection, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('is_current', 1)
        .maybeSingle()
      
      if (electionError) throw electionError
      if (!activeElection) return { data: [], error: null }
      
      // Then get the applications for the current election
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select(`
          *,
          election:elections(*),
          user:user_profile(*),
          position:positions(*),
          partylists:partylists_id(*)
        `)
        .eq('user_id', userProfile.id)
        .eq('election_id', activeElection.id)
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
    cancelApplication,
    getApplicationsByElection,
    updateApplicationStatus: async (id, status) => {
      clearError()
      
      try {
        // Convert status string to corresponding numeric value if needed
        const statusValue = typeof status === 'string' 
          ? STATUS[status.toUpperCase()] 
          : status;
            
        // First, get the application to get the user_id
        const { data: application, error: appError } = await supabase
          .from('candidacy_application')
          .select('*, user_id')
          .eq('id', id)
          .single()
          
        if (appError) throw appError
        
        // Update the application status
        const { data, error: updateError } = await supabase
          .from('candidacy_application')
          .update({ 
            status: statusValue,
          })
          .eq('id', id)
          .select()

        if (updateError) throw updateError
        
        // If the application is being approved, update the user's is_admin to 2 (candidate)
        if (statusValue === STATUS.APPROVED && application.user_id) {
          const { error: profileError } = await supabase
            .from('user_profile')
            .update({ is_admin: 2 })
            .eq('id', application.user_id);
          
          if (profileError) {
            console.error('Error updating user profile role:', profileError);
            // Don't fail the whole operation if role update fails
          }
        }
        
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
