import {defineStore} from 'pinia';
import { ref } from 'vue';
import { useSupabaseClient } from '#imports';

export const usePositionStore = defineStore('positions', () => {
    const supabase = useSupabaseClient();
    const positions = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const getPositions = async () => {
        try{
            const {data,error} = await supabase.from('positions').select('*');
            positions.value = data;
            return {data,error};
        }catch(e){
            console.log(e);
            return {data:null,error:e};
        }
    } 

    const addPosition = async (title, description, order, max_candidate) => {
        try{
            const {data,error} = await supabase.from('positions').insert([
                {
                    title,
                    description,
                    order,
                    max_candidate,
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
        deletePosition
    }
})