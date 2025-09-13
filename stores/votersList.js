import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';

export const useVotersListStore = defineStore('votersList', () => {
  const supabase = useSupabaseClient();
  const loading = ref(false);
  const error = ref(null);

  // Import voters from Excel data
  const importVoters = async (electionId, votersData) => {
    try {
      loading.value = true;
      error.value = null;

      // Transform and validate the data
      const votersToInsert = votersData.map(voter => ({
        election_id: electionId,
        reg_email: voter.email?.trim().toLowerCase() || '',
        created_at: new Date().toISOString()
      })).filter(voter => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(voter.reg_email);
      });

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('voters_list')
        .insert(votersToInsert)
        .select();

      if (insertError) throw insertError;
      return { data, error: null };
    } catch (err) {
      console.error('Error importing voters:', err);
      error.value = err.message || 'Failed to import voters';
      return { data: null, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Get voters for an election
  const getVotersByElection = async (electionId) => {
    try {
      loading.value = true;
      const { data, error: fetchError } = await supabase
        .from('voters_list')
        .select('*')
        .eq('election_id', electionId);

      if (fetchError) throw fetchError;
      return { data, error: null };
    } catch (err) {
      console.error('Error fetching voters:', err);
      error.value = err.message || 'Failed to fetch voters';
      return { data: null, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    importVoters,
    getVotersByElection
  };
});
