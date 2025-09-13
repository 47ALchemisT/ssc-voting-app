import {defineStore} from 'pinia';
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

    const addPosition = async (title, description, order) => {
        try{
            const {data,error} = await supabase.from('positions').insert([
                {
                    title,
                    description,
                    order,
                    created_at: new Date().toISOString()
                }
            ]);
            positions.value = data;
            return {data,error};
        }catch(e){
            console.log(e);
            return {data:null,error:e};
        }
    }

    return {
        positions,
        loading,
        error,
        getPositions,
        addPosition
    }
})