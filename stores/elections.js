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

  const updateElectionStatus = async (id, status, isCurrent = null) => {
    clearError();
    try {
      const updateData = { status };
      if (isCurrent !== null) {
        updateData.is_current = isCurrent;
      }
      
      const { data, error: err } = await supabase
        .from('elections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
  
      if (err) throw err;
  
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error updating election status:', err);
      return { data: null, error: err.message };
    }
  };

  
  const forceEndElection = async (electionId) => {
    try{
      const { data, error: err } = await supabase
        .from('elections')
        .update({ status: 'completed' })
        .eq('id', electionId)
        .select()
        .single();

      return { data, error: null };
    }catch (err){
      error.value = err.message;
      console.error('Error force ending election:', err);
      return { data: null, error: err.message };
    }
  };

  // Fetch all elections
  const fetchElections = async () => {
    loading.value = true;
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('elections')
        .select('*')
        .order('is_current', { ascending: false }) // Current election first
        .order('created_at', { ascending: false }); // Then sort by creation date

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
      // Get elections where is_current = 1 (active)
      const { data, error: err } = await supabase
        .from('elections')
        .select('*')
        .eq('is_current', 1)
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
        .select(`
          id,
          position_id,
          position:position_id (
            id,
            title,
            description,
            order
          ),
          partylist:partylists_id (
            name
          ),
          user_profile:user_id (
            first_name,
            last_name,
            college: college_id (
              college_name,
              alias
            ),
            avatar_url
          )
        `)
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

  // Extend the end date of an election
  const extendElectionEndDate = async (electionId, newEndDate) => {
    clearError();
    try {
      const { data, error: err } = await supabase
        .from('elections')
        .update({ end_date: newEndDate })
        .eq('id', electionId)
        .select()
        .single();

      if (err) throw err;
      
      // Update the local elections array if needed
      const index = elections.value.findIndex(e => e.id === electionId);
      if (index !== -1) {
        elections.value[index] = { ...elections.value[index], end_date: newEndDate };
      }
      
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error extending election end date:', err);
      return { data: null, error: err.message };
    }
  };

  // Get candidates for an election
  const getElectionCandidates = async (electionId) => {
    try {
      const { data, error: err } = await supabase
        .from('candidacy_application')
        .select(`
          *,
          user:user_id (*),
          position:position_id (*)
        `)
        .eq('election_id', electionId)
        .eq('status', 1) // Only get approved candidates (status = 1)
        .order('position_id', { ascending: true });

      if (err) return { data: null, error: err };
      
      // Format the data for easier use in components
      const formattedData = (data || []).map(candidate => {
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
            last_name: lastName,
            avatar_url: user.avatar_url || null
          },
          position: {
            id: position.id,
            title: position.title || 'Unknown Position',
            order: position.order || 0,
            description: position.description || '',
            max_candidate: position.max_candidate || 1,  // Include max_candidate with default of 1
            college_can_vote: position.college_can_vote || null,
          },
          // Convenience alias for UIs
          avatar_url: user.avatar_url || null,
          // For backward compatibility
          name: fullName,
          position_name: position.title || 'Unknown Position'
        };
      });
      
      return { 
        data: formattedData, 
        error: null 
      };
    } catch (err) {
      console.error('Error fetching election candidates:', err);
      return { 
        data: null, 
        error: err 
      };
    }
  };

  // Create a new election
  const createElection = async (electionData) => {
    loading.value = true;
    clearError();
    
    try {
      // First, update all current elections to not be current
      const { error: updateError } = await supabase
        .from('elections')
        .update({ is_current: 0 })
        .eq('is_current', 1);
      
      if (updateError) throw updateError;
      
      // Then, insert the new election as current
      const { data, error: insertError } = await supabase
        .from('elections')
        .insert([{
          title: electionData.title,
          description: electionData.description,
          start_date: electionData.startDate,
          end_date: electionData.endDate,
          status: 'upcoming',
          is_current: 1
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Refresh the elections list to get the updated data
      await fetchElections();
      
      return { data, error: null };
    } catch (err) {
      error.value = err.message;
      console.error('Error creating election:', err);
      return { data: null, error: err.message };
    } finally {
      loading.value = false;
    }
  };

  // Check if an election is active based on its status
  const isElectionActive = (election) => {
    if (!election || !election.status) return false;
    return election.status === 'ongoing' || election.status === 'upcoming';
  };

  const isElectionEnded = (election) => {
    if (!election || !election.status) return false;
    return election.status === 'completed';
  };

  // Check if the current time is past the current election's end date
  const isPastEndDate = async () => {
    // If elections array is empty, try to fetch them first
    if (elections.value.length === 0) {
      await fetchElections();
    }
    
    const currentElection = elections.value.find(e => e.is_current === 1);
    if (!currentElection || !currentElection.end_date) return false;
    
    const endDate = new Date(currentElection.end_date);
    const now = new Date();
    return now > endDate;
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
    updateElectionStatus,
    isElectionActive,
    isElectionEnded,
    clearError,
    extendElectionEndDate,
    forceEndElection,
    isPastEndDate
  };
});