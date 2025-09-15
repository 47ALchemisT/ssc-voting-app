// stores/elections.js
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import { ref } from 'vue';

export const useElectionStore = defineStore('elections', () => {
  const supabase = useSupabaseClient();
  const elections = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Clear error helper
  const clearError = () => {
    error.value = null;
  };

  // Fetch all elections
  const fetchElections = async () => {
    loading.value = true;
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      
      elections.value = data || [];
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching elections:', err);
      return { data: null, error: err.message };
    } finally {
      loading.value = false;
    }
  };

  // Get election by ID
  const getElectionById = async (id) => {
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;
      
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching election:', err);
      return { data: null, error: err.message };
    }
  };

  // Get current/active elections
  const getCurrentElections = async () => {
    clearError();
    
    try {
      const now = new Date().toISOString();
      
      const { data, error: err } = await supabase
        .from('elections')
        .select('*')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (err) throw err;
      
      return { data: data || [], error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching current elections:', err);
      return { data: [], error: err.message };
    }
  };

  // Get positions for an election
  const getElectionPositions = async (electionId) => {
    try {
      // First get distinct position_ids from candidacy_application for this election
      const { data: candidatePositions, error: cpErr } = await supabase
        .from('candidacy_application')
        .select('position_id')
        .eq('election_id', electionId)
        .not('position_id', 'is', null);

      if (cpErr) throw cpErr;

      if (!candidatePositions || candidatePositions.length === 0) {
        return [];
      }

      // Extract unique position IDs
      const positionIds = [...new Set(candidatePositions.map(cp => cp.position_id))];

      // Get the position details
      const { data: positionsData, error: posErr } = await supabase
        .from('positions')
        .select('*')
        .in('id', positionIds)
        .order('order', { ascending: true });

      if (posErr) throw posErr;
      
      return positionsData || [];
    } catch (err) {
      console.error('Error fetching election positions:', err);
      throw err;
    }
  };

  // Get candidates for an election
  const getElectionCandidates = async (electionId) => {
    try {
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select(`
          *,
          user:user_id (id, first_name, last_name),
          position:position_id (*)
        `)
        .eq('election_id', electionId)
        .eq('status', 1) // Only get approved candidates (status = 1)
        .order('position_id', { ascending: true });

      if (err) throw err;
      
      console.log('Raw candidates data from DB:', data);
      
      // Format the data for easier use in components
      return (data || []).map(candidate => {
        const position = candidate.position || {};
        const user = candidate.user || {};
        
        // Handle platform text (it might be a stringified JSON with an error)
        let platform = candidate.platform || '';
        try {
          if (typeof platform === 'string' && platform.trim().startsWith('{')) {
            const parsed = JSON.parse(platform);
            if (parsed && typeof parsed === 'object' && parsed.message) {
              platform = parsed.message; // Extract the error message if present
            }
          }
        } catch (e) {
          console.log('Platform is not JSON, using as is');
        }
        
        // Format the name properly with title case
        const formatName = (name) => {
          if (!name) return '';
          return name.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
        
        const firstName = formatName(user.first_name || '');
        const lastName = formatName(user.last_name || '');
        const fullName = `${firstName} ${lastName}`.trim();
        
        return {
          id: candidate.id,
          created_at: candidate.created_at,
          election_id: candidate.election_id,
          platform: platform,
          status: candidate.status,
          applied_at: candidate.applied_at,
          user_id: candidate.user_id,
          position_id: candidate.position_id,
          user: {
            id: user.id,
            first_name: firstName,
            last_name: lastName
          },
          position: {
            id: position.id,
            title: position.title || 'Unknown Position',
            order: position.order || 0,
            description: position.description || ''
          },
          // For backward compatibility
          name: fullName,
          position_name: position.title || 'Unknown Position'
        };
      });
    } catch (err) {
      console.error('Error fetching election candidates:', err);
      throw err;
    }
  };

  // Create a new election
  const createElection = async (electionData) => {
    loading.value = true;
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('elections')
        .insert([{
          title: electionData.title,
          description: electionData.description,
          start_date: electionData.startDate,
          end_date: electionData.endDate,
          status: 'upcoming' // You might want to add status management
        }])
        .select()
        .single();

      if (err) throw err;
      
      // Add the new election to the local state
      if (data) {
        elections.value = [data, ...elections.value];
      }
      
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error creating election:', err);
      return { data: null, error: err.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    elections,
    loading,
    error,
    
    // Actions
    fetchElections,
    getElectionById,
    getCurrentElections,
    getElectionPositions,
    getElectionCandidates,
    createElection,
    clearError
  };
});