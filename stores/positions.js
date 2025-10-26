import {defineStore} from 'pinia';
import { ref } from 'vue';
import { useSupabaseClient } from '#imports';

export const usePositionStore = defineStore('positions', () => {
    const supabase = useSupabaseClient();
    const positions = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const getPositions = async () => {
        try {
            const { data, error } = await supabase
                .from('positions')
                .select(`
                    *,
                    college:colleges (
                        id,
                        college_name,
                        alias
                    )
                `)
                .order('order', { ascending: true });
                
            positions.value = data || [];
            return { data, error };
        } catch (e) {
            console.error('Error fetching positions:', e);
            error.value = 'Failed to load positions';
            return { data: null, error: e };
        }
    } 

    const addPosition = async (title, description, order, max_candidate, college_can_vote) => {
        try{
            const {data,error} = await supabase.from('positions').insert([
                {
                    title,
                    description,
                    order,
                    max_candidate,
                    college_can_vote,
                    created_at: new Date().toISOString()
                }
            ]).select('*');
            positions.value = [data[0], ...positions.value];
            return {data,error};
        }catch(e){
            console.log(e);
            return {data:null,error:e};
        }
    }

    const updatePosition = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('positions')
                .update({
                    title: updates.title,
                    description: updates.description,
                    order: updates.order,
                    max_candidate: updates.max_candidate,
                    college_can_vote: updates.college_can_vote,
                })
                .eq('id', id)
                .select('*');

            if (!error && data && data.length > 0) {
                const index = positions.value.findIndex(p => p.id === id);
                if (index !== -1) {
                    positions.value[index] = { ...positions.value[index], ...data[0] };
                }
            }
            return { data, error };
        } catch (e) {
            console.error('Error updating position:', e);
            return { data: null, error: e };
        }
    };

    const deletePosition = async (id) => {
        try{
            const {error} = await supabase.from('positions').delete().eq('id',id);
            if(!error){
                positions.value = positions.value.filter(position => position.id !== id);
            }
            return {error};
        }catch(e){
            console.log(e);
            return {error:e};
        }
    }

    return {
        positions,
        loading,
        error,
        getPositions,
        addPosition,
        updatePosition,
        deletePosition
    }
})