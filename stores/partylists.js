// stores/partylists.js
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import { ref } from 'vue';
import { useAuthStore } from './auth';

export const usePartylistsStore = defineStore('partylists', () => {
    const supabase = useSupabaseClient()
    const authStore = useAuthStore()
    const partylists = ref([])
    const loading = ref(false)
    const error = ref(null)

    const clearError = () => {
        error.value = null
    }

    const fetchMyPartylist = async () => {
        loading.value = true
        clearError()
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .select('*')
                .eq('user_id', authStore.profile.id)
                .order('created_at', { ascending: false })
            if (err) throw err
            partylists.value = data || []
            return { data, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error fetching partylists:', err)
            return { data: null, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const fetchPartylists = async () => {
        loading.value = true
        clearError()
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .select('*')
                .eq('status', 1)
                .order('created_at', { ascending: false })
            if (err) throw err
            partylists.value = data || []
            return { data, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error fetching partylists:', err)
            return { data: null, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const updateParylistStatus = async (id, status) => {
        clearError()
        loading.value = true
        try {
            const { error: err } = await supabase
                .from('partylists')
                .update({ status })
                .eq('id', id)
            if (err) throw err
            return { error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error updating partylist status:', err)
            return { error: err.message }
        } finally {
            loading.value = false
        }
    }

    const fetchPendingPartylists = async () => {
        loading.value = true
        clearError()
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .select('*')
                .eq('status', 0)
                .order('created_at', { ascending: false })
            if (err) throw err
            partylists.value = data || []
            return { data, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error fetching partylists:', err)
            return { data: null, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const canCreatePartylist = async () => {
        clearError()
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .select('status')
                .eq('user_id', authStore.profile.id)
                .in('status', [0, 1]) // 0 = pending, 1 = approved
                .limit(1)
            
            if (err) throw err
            return { canCreate: data.length === 0, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error checking partylist creation eligibility:', err)
            return { canCreate: false, error: err.message }
        }
    }

    const createPartylist = async (partylistData) => {
        clearError()
        loading.value = true
        try {
            // Check if user can create a new partylist
            const { canCreate, error: checkError } = await canCreatePartylist()
            if (checkError) throw checkError
            if (!canCreate) {
                throw new Error('You already have an active partylist. Please wait for it to be reviewed.')
            }
            
            // Ensure user profile is loaded
            if (!authStore.profile) {
                await authStore.fetchProfile()
            }
            
            if (!authStore.profile) {
                throw new Error('User profile not found')
            }

            const { data, error: err } = await supabase
                .from('partylists')
                .insert({
                    name: partylistData.name,
                    description: partylistData.description || null,
                    platform: partylistData.platform || null,
                    date_founded: partylistData.date_founded || null,
                    user_id: authStore.profile.id,
                    status: 0 // Set status to pending by default
                })
                .select()
                .single()
                
            if (err) throw err
            
            partylists.value = [data, ...partylists.value]
            return { data, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error creating partylist:', err)
            return { data: null, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const updatePartylist = async (id, partylistData) => {
        clearError()
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .update({
                    name: partylistData.name,
                    description: partylistData.description || null,
                    platform: partylistData.platform || null,
                    date_founded: partylistData.date_founded || null,
                })
                .eq('id', id)
                .select()
                .single()
            if (err) throw err
            partylists.value = partylists.value.map(partylist => 
                partylist.id === id ? { ...partylist, ...data } : partylist
            )
            return { data, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error updating partylist:', err)
            return { data: null, error: err.message }
        } finally {
            loading.value = false
        }
    }

    const deletePartylist = async (id) => {
        clearError()
        loading.value = true
        try {
            const { error: err } = await supabase
                .from('partylists')
                .update({ status: 3 })
                .eq('id', id)
                .select()
                .single()
                
            if (err) throw err
            
            // Update local state
            const index = partylists.value.findIndex(p => p.id === id)
            if (index !== -1) {
                partylists.value[index].status = 3
            }
            
            return { data: { id, status: 3 }, error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error deactivating partylist:', err)
            return { error: err.message }
        } finally {
            loading.value = false
        }
    }


    return {
        partylists,
        loading,
        error,
        clearError,
        fetchPartylists,
        createPartylist,
        updatePartylist,
        deletePartylist,
        fetchPendingPartylists, 
        updateParylistStatus,
        fetchMyPartylist,
        canCreatePartylist
    }
})