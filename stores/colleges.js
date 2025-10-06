import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import { ref } from 'vue';

export const useColleges = defineStore('colleges', () => {
    const supabase = useSupabaseClient()
    const colleges = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Upload logo to storage
    const uploadLogo = async (file) => {
      try {
        if (!file) return { data: null, error: 'No file provided' }

        // Create a unique file path (college-logo + timestamp + filename)
        const fileExt = file.name.split('.').pop()
        const filePath = `college-logos/college-${Date.now()}.${fileExt}`

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // Prevent overwriting existing files
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath)

        return { data: data.publicUrl, error: null }
      } catch (err) {
        console.error('Error uploading logo:', err)
        return { data: null, error: err.message }
      }
    }
  
    const getColleges = async () => {
      loading.value = true
      try {
        const { data, error: err } = await supabase
          .from('colleges')
          .select('id, college_name, alias, college_logo')
          .order('college_name', { ascending: true })
        
        if (err) throw err
        colleges.value = data || []
        return { data: colleges.value, error: null }
      } catch (err) {
        error.value = err.message
        return { data: null, error: err.message }
      } finally {
        loading.value = false
      }
    }
  
    const storeColleges = async (payload) => {
      loading.value = true
      try {
        // If there's a file to upload, handle it first
        let logoUrl = null
        if (payload.logoFile) {
          const { data: uploadedLogo, error: uploadError } = await uploadLogo(payload.logoFile)
          if (uploadError) throw uploadError
          logoUrl = uploadedLogo
        }

        const { data: inserted, error: err } = await supabase
          .from('colleges')
          .insert([
            {
              college_name: payload.college_name,
              alias: payload.alias,
              college_logo: logoUrl || payload.college_logo,
              created_at: new Date().toISOString()
            }
          ])
          .select('*')
  
        if (err) throw err
        
        // Update local state
        if (inserted && inserted.length > 0) {
          colleges.value = [...colleges.value, ...inserted]
        }
        
        return { data: inserted, error: null }
      } catch (err) {
        error.value = err.message
        return { data: null, error: err.message }
      } finally {
        loading.value = false
      }
    }
    const updateCollege = async (id, payload) => {
        loading.value = true;
        try {
          let logoUrl = payload.college_logo;
          
          if (payload.logoFile) {
            const { data: uploadedLogo, error: uploadError } = await uploadLogo(payload.logoFile);
            if (uploadError) throw uploadError;
            logoUrl = uploadedLogo;
          }
      
          const { data: updated, error: err } = await supabase
            .from('colleges')
            .update({
              college_name: payload.college_name,
              alias: payload.alias,
              college_logo: logoUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*');
      
          if (err) throw err;
      
          if (updated && updated.length > 0) {
            const index = colleges.value.findIndex(c => c.id === id);
            if (index !== -1) {
              colleges.value[index] = updated[0];
            }
          }
      
          return { data: updated, error: null };
        } catch (err) {
          error.value = err.message;
          return { data: null, error: err.message };
        } finally {
          loading.value = false;
        }
    };
    
    const deleteCollege = async (id) => {
    loading.value = true;
    try {
        const { error: err } = await supabase
        .from('colleges')
        .delete()
        .eq('id', id);
    
        if (err) throw err;
    
        colleges.value = colleges.value.filter(college => college.id !== id);
    
        return { error: null };
    } catch (err) {
        error.value = err.message;
        return { error: err.message };
    } finally {
        loading.value = false;
    }
    };
  
    return {
      colleges,
      loading,
      error,
      storeColleges,
      getColleges,
      updateCollege,
      deleteCollege,
      uploadLogo
    }
  })