<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ election?.title || 'Election' }}</h1>
      <p class="text-gray-600 mt-2">Cast your vote for each position</p>
      
      <div class="mt-4 p-4 bg-blue-50 rounded-lg text-left">
        <h3 class="font-medium text-blue-800">Voting Instructions</h3>
        <ul class="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
          <li>Select one candidate per position</li>
          <li>Review your choices before submitting</li>
          <li>You cannot change your vote after submission</li>
        </ul>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading voting form...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Voting Form -->
    <div v-else class="space-y-8">
      <div v-for="position in positions" :key="position.id" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-medium text-gray-900">{{ position.name }}</h3>
          <p class="text-sm text-gray-500">Select one candidate</p>
        </div>
        
        <div class="divide-y divide-gray-200">
          <div 
            v-for="candidate in getCandidatesByPosition(position.id)" 
            :key="candidate.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'bg-blue-50': selectedVotes[position.id] === candidate.id }"
            @click="selectCandidate(position.id, candidate.id)"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0 h-36 w-36 rounded-lg bg-blue-100 flex items-center justify-center">
                <img :src="candidate.avatar_url || candidate.user?.avatar_url || '/images/avatar/default.png'" alt="Candidate Avatar" class="h-full w-full object-cover rounded-lg">
              </div>
              <div class="ml-4 flex justify-between w-full">
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ candidate.name || 'Unknown Candidate' }}</h4>
                  <p class="text-sm text-gray-500">Running for {{ position.name }}</p>
                  <div v-if="candidate.platform && typeof candidate.platform === 'string'" class="mt-3 text-sm text-gray-600">
                    <p class="font-medium text-gray-800">Platform:</p>
                    <p v-if="!expandedPlatforms[candidate.id]" class="mt-1 text-gray-600 line-clamp-2">{{ candidate.platform }}</p>
                    <p v-else class="mt-1 text-gray-600">{{ candidate.platform }}</p>
                    <span
                      class="mt-1 p-0 text-blue-500 font-medium"
                      @click.stop="togglePlatform(candidate.id)"
                    >
                      {{ expandedPlatforms[candidate.id] ? 'See less' : 'See more' }}
                    </span>
                  </div>
                </div>
                <!--checkbox-->
                <div class="ml-4">
                  <div class="h-5 w-5 rounded-full border-2 flex items-center justify-center"
                       :class="{ 'bg-blue-500 border-blue-500': selectedVotes[position.id] === candidate.id, 'border-gray-300': selectedVotes[position.id] !== candidate.id }">
                    <i v-if="selectedVotes[position.id] === candidate.id" class="pi pi-check text-white text-xs"></i>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <!-- No candidates -->
          <div v-if="getCandidatesByPosition(position.id).length === 0" class="px-6 py-4 text-center text-gray-500">
            No candidates running for this position
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="sticky bottom-0 bg-white border rounded-lg border-gray-200 -mx-6 p-4 shadow-sm">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col space-y-2">
            <!-- Voting Progress -->
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                :style="{ width: `${(votedPositionsCount / positions.length) * 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-600">
                {{ votedPositionsCount }} of {{ positions.length }} positions voted
              </p>
              <span class="text-sm font-medium text-gray-900">
                {{ Math.round((votedPositionsCount / positions.length) * 100) }}% Complete
              </span>
            </div>
          </div>
          
          <div class="mt-4 flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">
                {{ positions.length - votedPositionsCount }} more positions to vote
              </p>
              <p class="text-xs text-gray-500">
                Please vote for all positions before submitting
              </p>
            </div>
            <Button 
              label="Submit Votes"
              icon="pi pi-check-circle"
              :disabled="Object.keys(selectedVotes).length !== positions.length || isSubmitting"
              :loading="isSubmitting"
              @click="submitVotes"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVoteStore } from '../../../../stores/votes';
import { useAuthStore } from '../../../../stores/auth';
import { useElectionStore } from '../../../../stores/elections';

const route = useRoute();
const router = useRouter();
const voteStore = useVoteStore();
const authStore = useAuthStore();
const electionStore = useElectionStore();

const electionId = route.params.id;
const election = ref(null);
const positions = ref([]);
const candidates = ref([]);
const selectedVotes = ref({});
const loading = ref(true);
const isSubmitting = ref(false);
const error = ref(null);
// Track expanded/collapsed state per candidate for platform text
const expandedPlatforms = ref({});

// Computed
const getCandidatesByPosition = (positionId) => {
  if (!candidates.value || !Array.isArray(candidates.value)) {
    console.warn('Candidates data is not available or not an array');
    return [];
  }

  console.log('Filtering candidates for position ID:', positionId);
  console.log('All candidates:', JSON.parse(JSON.stringify(candidates.value)));
  
  const filtered = candidates.value.filter(candidate => {
    const matches = 
      candidate.position_id === positionId || 
      (candidate.position && candidate.position.id === positionId);
    
    console.log(`Candidate ${candidate.id} matches position ${positionId}:`, matches, 
      'position_id:', candidate.position_id, 
      'position object:', candidate.position);
      
    return matches;
  });
  
  console.log(`Found ${filtered.length} candidates for position ${positionId}:`, filtered);
  
  const mappedCandidates = filtered.map(candidate => {
    const positionTitle = candidate.position?.title || 
                         (candidate.position_id ? `Position ${candidate.position_id}` : 'Unknown Position');
    
    const user = candidate.user || {};
    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Unknown Candidate';
    
    return {
      id: candidate.id,
      name: fullName,
      avatar_url: candidate.avatar_url,
      position_id: candidate.position_id || (candidate.position?.id || null),
      position: positionTitle,
      platform: candidate.platform || 'No platform provided',
      user: user
    };
  });
  
  console.log('Mapped candidates:', mappedCandidates);
  return mappedCandidates;
};

// Methods
const togglePlatform = (id) => {
  expandedPlatforms.value[id] = !expandedPlatforms.value[id];
};
const selectCandidate = (positionCode, candidateId) => {
  // If clicking the same candidate, deselect
  if (selectedVotes.value[positionCode] === candidateId) {
    selectedVotes.value = {
      ...selectedVotes.value,
      [positionCode]: null
    };
  } else {
    // Select the new candidate for this position
    selectedVotes.value = {
      ...selectedVotes.value,
      [positionCode]: candidateId
    };
  }
  console.log('Selected votes:', selectedVotes.value);
};

// Check if all positions have been voted for
const allPositionsVoted = computed(() => {
  return positions.value.every(position => selectedVotes.value[position.id]);
});

// Get the number of positions with votes
const votedPositionsCount = computed(() => {
  return Object.values(selectedVotes.value).filter(vote => vote !== null).length;
});

const submitVotes = async () => {
  if (Object.keys(selectedVotes.value).length !== positions.value.length) {
    error.value = 'Please select a candidate for each position';
    return;
  }

  try {
    isSubmitting.value = true;
    
    // Create vote objects for each position
    const votes = Object.entries(selectedVotes.value).map(([positionCode, candidateId]) => {
      const candidate = candidates.value.find(c => c.id === candidateId);
      return {
        election_id: parseInt(electionId),
        position: positionCode,
        candidate_id: candidateId,
        voter_id: authStore.profile?.id,
        created_at: new Date().toISOString()
      };
    });

    console.log('Submitting votes:', votes);
    
    // Submit all votes
    console.log('Submitting votes...');
    const results = await Promise.all(votes.map(vote => voteStore.submitVote(vote)));
    console.log('Votes submitted successfully:', results);
    
    // Add a small delay to ensure all state is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to confirmation page
    console.log('Navigating to confirmation page...');
    await router.push(`/elections/${electionId}/confirmation`);
    console.log('Navigation complete');
  } catch (err) {
    console.error('Error in submitVotes:', err);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    error.value = 'Failed to submit votes. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const fetchElectionData = async () => {
  try {
    loading.value = true;
    
    // Fetch election details
    election.value = await electionStore.getElectionById(electionId);
    
    // Fetch candidates for this election
    const candidatesData = await electionStore.getElectionCandidates(electionId);
    console.log('Raw candidates data:', candidatesData);
    candidates.value = candidatesData;
    
    // Debug log the candidates data
    console.log('Processing candidates data:', JSON.parse(JSON.stringify(candidatesData)));
    
    // First, collect all unique position objects from candidates
    const positionMap = new Map();
    
    candidatesData.forEach(candidate => {
      if (candidate.position && candidate.position.id) {
        const pos = candidate.position;
        if (!positionMap.has(pos.id)) {
          positionMap.set(pos.id, {
            id: pos.id,
            name: pos.title || `Position ${pos.id}`,
            order: pos.order || 0,
            ...pos  // Include all position properties
          });
        }
      }
    });
    
    // If no positions found in candidate objects, try to get them directly
    if (positionMap.size === 0) {
      try {
        const { data: positionsData } = await electionStore.getElectionPositions(electionId);
        if (positionsData && positionsData.length > 0) {
          positionsData.forEach(pos => {
            positionMap.set(pos.id, {
              id: pos.id,
              name: pos.title || `Position ${pos.id}`,
              order: pos.order || 0,
              ...pos
            });
          });
        }
      } catch (err) {
        console.error('Error fetching positions:', err);
      }
    }
    
    // Convert to array and sort by order
    const sortedPositions = Array.from(positionMap.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    positions.value = sortedPositions;
    console.log('Processed positions:', JSON.parse(JSON.stringify(sortedPositions)));
    
    // Check if user has already voted using their profile ID
    const hasVoted = await voteStore.hasUserVoted(authStore.profile?.id, electionId);
    if (hasVoted) {
      router.push(`/elections/${electionId}/confirmation`);
      return;
    }
    
  } catch (err) {
    console.error('Error fetching election data:', err);
    error.value = 'Failed to load election data. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/elections/${electionId}/vote`);
    return;
  }
  
  fetchElectionData();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
