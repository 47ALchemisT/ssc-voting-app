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

      // Get existing emails for this election
      const { data: existingVoters, error: fetchError } = await supabase
        .from('voters_list')
        .select('reg_email')
        .eq('election_id', electionId);

      if (fetchError) throw fetchError;

      const existingEmails = new Set(existingVoters.map(v => v.reg_email.toLowerCase()));

      // Transform, validate and filter the data
      const votersToInsert = votersData
        .map(voter => ({
          election_id: electionId,
          reg_email: voter.email?.trim().toLowerCase() || '',
          fullname: voter.fullname?.trim() || null,
          college: voter.college?.trim() || null,
          school_id: voter.school_id?.trim() || null,
          created_at: new Date().toISOString()
        }))
        .filter(voter => {
          // Validate email format and check if it already exists
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(voter.reg_email) && !existingEmails.has(voter.reg_email);
        });

      // If no new voters to insert, return early
      if (votersToInsert.length === 0) {
        return { 
          data: [], 
          error: null,
          skipped: votersData.length,
          imported: 0
        };
      }

      // Insert only new voters into database
      const { data, error: insertError } = await supabase
        .from('voters_list')
        .insert(votersToInsert)
        .select();

      if (insertError) throw insertError;
      
      return { 
        data, 
        error: null,
        skipped: votersData.length - votersToInsert.length,
        imported: votersToInsert.length
      };
    } catch (err) {
      console.error('Error importing voters:', err);
      error.value = err.message || 'Failed to import voters';
      return { 
        data: null, 
        error: error.value,
        skipped: 0,
        imported: 0
      };
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
        .eq('election_id', electionId)
        .order('created_at', { ascending: false });

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
    getVotersByElection,
  };
});
