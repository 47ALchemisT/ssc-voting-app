// stores/partylists.js
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import { ref } from 'vue';

export const usePartylistsStore = defineStore('partylists', () => {
    const supabase = useSupabaseClient()
    const partylists = ref([])
    const loading = ref(false)
    const error = ref(null)

    const clearError = () => {
        error.value = null
    }

    const fetchPartylists = async () => {
        loading.value = true
        clearError()
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .select('*')
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

    const createPartylist = async (partylistData) => {
        clearError()
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('partylists')
                .insert({
                    name: partylistData.name,
                    description: partylistData.description || null,
                    platform: partylistData.platform || null,
                    date_founded: partylistData.date_founded || null
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
                .delete()
                .eq('id', id)
            if (err) throw err
            partylists.value = partylists.value.filter(partylist => partylist.id !== id)
            return { error: null }
        } catch (err) {
            error.value = err.message
            console.error('Error deleting partylist:', err)
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
        deletePartylist
    }
})