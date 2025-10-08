import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import { useAuthStore } from './auth';
import { ref } from 'vue';

export const useVoteStore = defineStore('votes', () => {
  const supabase = useSupabaseClient();
  const votes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();

  // Clear error helper
  const clearError = () => {
    error.value = null;
  };

  // Submit a new vote
  const submitVote = async (voteData) => {
    loading.value = true;
    clearError();
    
    try {
      console.log('Submitting vote:', voteData);
      
      const { data, error: err } = await supabase
        .from('votes')
        .insert([{
          election_id: voteData.election_id,
          candidate_id: voteData.candidate_id,
          voter_id: voteData.voter_id,
          created_at: voteData.created_at || new Date().toISOString()
        }])
        .select('*')
        .single();

      if (err) {
        console.error('Supabase error:', err);
        throw err;
      }
      
      console.log('Vote submitted successfully:', data);
      
      // Add to local state
      votes.value.push(data);
      return data;
      
    } catch (err) {
      console.error('Error in submitVote:', err);
      error.value = err.message || 'Failed to submit vote';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if the user is eligible to vote in the specified election
  // @param {string} userEmail - The email of the user to check
  // @param {number} electionId - The ID of the election to check against
  // @returns {Promise<{isEligible: boolean, error: string|null}>}
  const fetchAllVotersList = async (electionId) => {
    try {
      const { data, error } = await supabase
        .from('voters_list')
        .select('*')
        .eq('election_id', electionId);

      if (error) {
        console.error('Error fetching voters list:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchAllVotersList:', error);
      throw error;
    }
  };

  const isUserEligibleToVote = async (electionId) => {
    try {
      if (!authStore.user?.email || !electionId) {
        return { isEligible: false, error: 'Missing required parameters' };
      }

      const userEmail = authStore.user.email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('voters_list')
        .select('id, reg_email, election_id')
        .eq('election_id', electionId)
        .eq('reg_email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Database error in isUserEligibleToVote:', error);
        throw error;
      }

      return { 
        isEligible: !!data,
        error: null
      };
      
    } catch (err) {
      console.error('Error in isUserEligibleToVote:', err);
      return { 
        isEligible: false, 
        error: 'An error occurred while checking your eligibility. Please try again.'
      };
    }
  }

  // Get all votes for a user in a specific election
  // Get vote statistics for an election
  const getVoteStatistics = async (electionId) => {
    loading.value = true;
    clearError();
    
    try {
      // First, get all votes for this election
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', electionId);

      if (votesError) throw votesError;

      // Get all candidates for this election with user profile and position data
      const { data: candidates, error: candidatesError } = await supabase
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
          user_profile:user_id (
            first_name,
            last_name,
            college: college_id (
              college_name
            ),
            avatar_url
          )
        `)
        .eq('election_id', electionId)
        .eq('status', 1) //status 1 is approved
        .order('order', { foreignTable: 'position_id' });

      if (candidatesError) throw candidatesError;

      // Count votes per candidate
      const voteCounts = {};
      votes.forEach(vote => {
        voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
      });

      // Group candidates by position
      const positions = {};
      candidates.forEach(candidate => {
        if (!positions[candidate.position_id]) {
          positions[candidate.position_id] = {
            id: candidate.position_id,
            title: candidate.position?.title || `Position #${candidate.position_id}`,
            description: candidate.position?.description || '',
            order: candidate.position?.order || 0,
            candidates: []
          };
        }
        const fullName = candidate.user_profile 
          ? `${candidate.user_profile.first_name || ''} ${candidate.user_profile.last_name || ''}`.trim()
          : `Candidate #${candidate.id}`;
          
        positions[candidate.position_id].candidates.push({
          id: candidate.id,
          name: fullName,
          avatar_url: candidate.user_profile?.avatar_url || null,
          vote_count: voteCounts[candidate.id] || 0
        });
      });
      
      // Convert to array and sort by position order
      const sortedPositions = Object.values(positions).sort((a, b) => a.order - b.order);

      return sortedPositions;
      
    } catch (err) {
      console.error('Error fetching vote statistics:', err);
      error.value = err.message || 'Failed to fetch vote statistics';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if user has already voted in an election
  const hasUserVoted = async (userId, electionId) => {
    if (!userId || !electionId) return false;
    
    try {
      const { data, error: err } = await supabase
        .from('votes')
        .select('id, voter_id')
        .eq('election_id', electionId)
        .eq('voter_id', userId);

      if (err) throw err;
      
      return data && data.length > 0;
      
    } catch (err) {
      console.error('Error checking vote status:', err);
      return false;
    }
  };
  
  // Check if current user has voted in the current election
  const hasCurrentUserVoted = async (electionId) => {
    if (!authStore.profile?.id) return false;
    return await hasUserVoted(authStore.profile.id, electionId);
  };

  // Get all votes for a user in a specific election
  const getUserVotes = async (userId, electionId) => {
    loading.value = true;
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('votes')
        .select(`
          id,
          election_id,
          candidate_id,
          candidate:candidacy_application(
            id,
            user:user_profile(
              id,
              first_name,
              last_name
            ),
            position:positions(
              id,
              title,
              description,
              order
            )
          )
        `)
        .eq('voter_id', userId)
        .eq('election_id', electionId);

      if (err) throw err;
      
      // Update local state
      votes.value = data || [];
      return data || [];
      
    } catch (err) {
      console.error('Error fetching user votes:', err);
      error.value = err.message || 'Failed to fetch votes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get all votes for an election
  const getVotesByElection = (electionId) => {
    if (electionId === undefined || electionId === null) {
      console.warn('getVotesByElection called with undefined or null electionId');
      return [];
    }
    // Convert both to strings for comparison to handle number/string mismatches
    const targetElectionId = String(electionId);
    return votes.value.filter(vote => 
      vote && String(vote.election_id) === targetElectionId
    );
  };

  // Get all votes for a candidate
  const getVotesByCandidate = (candidateId) => {
    return votes.value.filter(vote => vote.candidate_id === candidateId);
  };

  // Fetch all votes from the database
  const fetchVotes = async () => {
    loading.value = true;
    clearError();
    
    try {
      const { data, error: err } = await supabase
        .from('votes')
        .select('*');

      if (err) throw err;
      
      votes.value = data || [];
      return data;
    } catch (err) {
      console.error('Error fetching votes:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    votes,
    loading,
    error,
    
    // Actions
    submitVote,
    fetchVotes,
    fetchAllVotersList,
    isUserEligibleToVote,
    getVoteStatistics,
    hasUserVoted,
    getUserVotes,
    getVotesByElection,
    getVotesByCandidate,
    isUserEligibleToVote,
    fetchAllVotersList,
    getVoteStatistics,
    hasCurrentUserVoted,
  };
});