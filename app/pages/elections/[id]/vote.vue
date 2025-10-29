<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <!-- Guidelines Modal -->
    <Dialog 
      v-model:visible="showGuidelines" 
      :modal="true" 
      :closable="false"
      :closeOnEscape="false"
      :style="{ width: '90vw', maxWidth: '600px' }"
      header="Voting Guidelines"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div class="flex items-start">
            <i class="pi pi-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-blue-800 mb-2">Important Instructions</h4>
              <ul class="space-y-2 text-sm text-blue-700">
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>You must vote for <strong>all positions</strong> to complete your ballot</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>Select the specified number of candidates for each position</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>Review your selections carefully before submitting</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span><strong>Your vote cannot be changed</strong> after submission</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>Click on a candidate card to select or deselect them</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-amber-600 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-amber-800 mb-2">Before You Proceed</h4>
              <p class="text-sm text-amber-700">
                Make sure you have reviewed all candidates and their platforms. 
                Take your time to make informed decisions.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-2 pt-2">
          <Checkbox v-model="acknowledgedGuidelines" inputId="acknowledge" binary />
          <label for="acknowledge" class="text-sm text-gray-700">
            I have read and understood the voting guidelines
          </label>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Continue to Vote" 
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="!acknowledgedGuidelines"
          @click="startVoting"
          class="w-full"
        />
      </template>
    </Dialog>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i class="pi pi-check-square text-2xl text-blue-600"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ election?.title || 'Election' }}</h1>
          <p class="text-gray-600">Cast your vote for each position</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading voting form...</p>
        </div>
      </div>

      <!-- Voting Form -->
      <div v-else class="space-y-6">
        <!-- Progress Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Voting Progress</h3>
            <span class="text-2xl font-bold" :class="{ 
              'text-red-600': hasExceededMaxCandidates, 
              'text-blue-600': !hasExceededMaxCandidates && validVotedPositionsCount < positions.length,
              'text-green-600': !hasExceededMaxCandidates && validVotedPositionsCount === positions.length
            }">
              {{ Math.round((validVotedPositionsCount / positions.length) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              class="h-3 rounded-full transition-all duration-500" 
              :style="{ width: `${(validVotedPositionsCount / positions.length) * 100}%` }"
              :class="{ 
                'bg-red-500': hasExceededMaxCandidates,
                'bg-blue-500': !hasExceededMaxCandidates && validVotedPositionsCount < positions.length,
                'bg-green-500': !hasExceededMaxCandidates && validVotedPositionsCount === positions.length
              }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            {{ validVotedPositionsCount }} of {{ positions.length }} positions completed
            <span v-if="hasExceededMaxCandidates" class="text-red-600 font-medium ml-2">
              • Please review your selections
            </span>
          </p>
        </div>

        <!-- Position Cards -->
        <div v-for="(position, index) in positions" :key="position.id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- Position Header -->
          <div class="px-6 py-4 border-b border-gray-200"
               :class="{
                 'bg-blue-50': getSelectedCandidatesCount(position.id) > 0 && getSelectedCandidatesCount(position.id) <= position.max_candidate,
                 'bg-red-50': getSelectedCandidatesCount(position.id) > position.max_candidate,
                 'bg-gray-50': getSelectedCandidatesCount(position.id) === 0
               }">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                     :class="{
                       'bg-blue-500': getSelectedCandidatesCount(position.id) > 0 && getSelectedCandidatesCount(position.id) <= position.max_candidate,
                       'bg-red-500': getSelectedCandidatesCount(position.id) > position.max_candidate,
                       'bg-gray-400': getSelectedCandidatesCount(position.id) === 0
                     }">
                  {{ index + 1 }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ position.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ position.max_candidate > 1 ? `Select up to ${position.max_candidate} candidates` : 'Select one candidate' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                     :class="{
                       'bg-blue-100 text-blue-700': getSelectedCandidatesCount(position.id) > 0 && getSelectedCandidatesCount(position.id) <= position.max_candidate,
                       'bg-red-100 text-red-700': getSelectedCandidatesCount(position.id) > position.max_candidate,
                       'bg-gray-100 text-gray-600': getSelectedCandidatesCount(position.id) === 0
                     }">
                  <i class="pi mr-1.5"
                     :class="{
                       'pi-check-circle': getSelectedCandidatesCount(position.id) === position.max_candidate && getSelectedCandidatesCount(position.id) <= position.max_candidate,
                       'pi-exclamation-circle': getSelectedCandidatesCount(position.id) > position.max_candidate,
                       'pi-circle': getSelectedCandidatesCount(position.id) === 0
                     }"></i>
                  {{ getSelectedCandidatesCount(position.id) }}/{{ position.max_candidate }}
                </div>
                <p v-if="getSelectedCandidatesCount(position.id) > position.max_candidate" class="text-xs text-red-600 mt-1">
                  Too many selected
                </p>
              </div>
            </div>
          </div>
          
          <!-- Candidates Grid -->
          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="candidate in getCandidatesByPosition(position.id)" 
              :key="candidate.id"
              class="relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
              :class="{ 
                'border-blue-500 bg-blue-50': isCandidateSelected(position.id, candidate.id),
                'border-gray-200 hover:border-gray-300': !isCandidateSelected(position.id, candidate.id)
              }"
              @click="toggleCandidate(position, candidate.id)"
            >
              <!-- Selection Indicator -->
              <div class="absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                   :class="{ 
                     'bg-blue-500 border-blue-500': isCandidateSelected(position.id, candidate.id), 
                     'border-gray-300 bg-white': !isCandidateSelected(position.id, candidate.id) 
                   }">
                <i v-if="isCandidateSelected(position.id, candidate.id)" class="pi pi-check text-white text-xs"></i>
              </div>

              <div class="flex items-start space-x-4">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div v-if="candidate.avatar_url" class="w-28 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img :src="candidate.avatar_url" alt="Candidate Avatar" class="w-full h-full object-cover">
                  </div>
                  <div v-else class="w-28 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-200">
                    <span class="text-2xl font-bold text-white">
                      {{ getInitials(candidate.name) }}
                    </span>
                  </div>
                </div>

                <!-- Candidate Info -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-base font-semibold text-gray-900 truncate">{{ candidate.name || 'Unknown Candidate' }}</h4>
                  <div class="flex items-center text-xs">
                    <span>{{ candidate.college || 'No College' }}</span>
                  </div>
                  <!-- Partylist and College Info -->
                  <div class=" text-sm font-medium text-blue-600 mt-2">
                    <div class="flex items-center">
                      <span>Partylist: {{ candidate.partylist || 'No Partylist' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No candidates -->
            <div v-if="getCandidatesByPosition(position.id).length === 0" class="col-span-full text-center py-8 text-gray-500">
              <i class="pi pi-inbox text-3xl mb-2"></i>
              <p>No candidates running for this position</p>
            </div>
          </div>
        </div>

        <!-- Submit Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-4">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-center sm:text-left">
              <p class="text-sm font-medium text-gray-900">
                Ready to submit your votes?
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ positions.length - validVotedPositionsCount }} more {{ positions.length - validVotedPositionsCount === 1 ? 'position' : 'positions' }} to complete
                <span v-if="hasExceededMaxCandidates" class="text-red-600 block mt-1">
                  • Please review your selections
                </span>
              </p>
            </div>
            <Button 
              label="Submit Votes"
              icon="pi pi-check-circle"
              iconPos="right"
              :disabled="!allPositionsVoted || isSubmitting"
              :loading="isSubmitting"
              @click="submitVotes"
              size="large"
              class="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVoteStore } from '../../../../stores/votes';
import { useAuthStore } from '../../../../stores/auth';
import { useElectionStore } from '../../../../stores/elections';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const route = useRoute();
const router = useRouter();
const toast = useToast();
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
const expandedPlatforms = ref({});
const showGuidelines = ref(true);
const acknowledgedGuidelines = ref(false);

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Start voting after acknowledging guidelines
const startVoting = () => {
  showGuidelines.value = false;
};

// Computed
const getCandidatesByPosition = (positionId) => {
  if (!candidates.value || !Array.isArray(candidates.value)) {
    console.warn('Candidates data is not available or not an array');
    return [];
  }
  
  const filtered = candidates.value.filter(candidate => {
    return candidate.position_id === positionId || 
           (candidate.position && candidate.position.id === positionId);
  });
  
  const mappedCandidates = filtered.map(candidate => {
    const positionTitle = candidate.position?.title || 
                         (candidate.position_id ? `Position ${candidate.position_id}` : 'Unknown Position');
    
    // Get name from user_profile first, then user
    const fullName = candidate.name || 
                    `${candidate.user_profile?.first_name || candidate.user?.first_name || ''} ${candidate.user_profile?.last_name || candidate.user?.last_name || ''}`.trim() || 
                    'Unknown Candidate';
    
    // Get partylist name - it's already in the correct format from the API
    const partylistName = candidate.partylist?.name || 'No Partylist';
    
    // Get college name from user_profile.college
    const collegeName = candidate.user_profile?.college?.college_name || 
                       candidate.user_profile?.college?.alias || 
                       candidate.user?.college?.college_name ||
                       'No College';
    
    // Use avatar_url from user_profile if available
    const avatarUrl = candidate.user_profile?.avatar_url || 
                     candidate.avatar_url || 
                     candidate.user?.avatar_url || 
                     null;
    
    return {
      id: candidate.id,
      name: fullName,
      avatar_url: avatarUrl,
      position_id: candidate.position_id || (candidate.position?.id || null),
      position: positionTitle,
      partylist: partylistName,
      college: collegeName,
      platform: candidate.platform || 'No platform provided',
      user: {
        ...candidate.user,
        first_name: candidate.user?.first_name || candidate.user_profile?.first_name,
        last_name: candidate.user?.last_name || candidate.user_profile?.last_name,
        avatar_url: avatarUrl
      }
    };
  });
  
  return mappedCandidates;
};

// Methods
const togglePlatform = (id) => {
  expandedPlatforms.value[id] = !expandedPlatforms.value[id];
};

const isCandidateSelected = (positionId, candidateId) => {
  return selectedVotes.value[positionId]?.includes(candidateId) || false;
};

const getSelectedCandidatesCount = (positionId) => {
  return (selectedVotes.value[positionId] || []).length;
};

const toggleCandidate = (position, candidateId) => {
  const positionId = position.id;
  const maxCandidates = position.max_candidate || 1;
  
  if (!selectedVotes.value[positionId]) {
    selectedVotes.value[positionId] = [];
  }
  
  const currentSelections = [...(selectedVotes.value[positionId] || [])];
  const candidateIndex = currentSelections.indexOf(candidateId);
  
  if (candidateIndex > -1) {
    currentSelections.splice(candidateIndex, 1);
  } else {
    if (currentSelections.length >= maxCandidates) {
      toast.add({
        severity: 'warn',
        summary: 'Selection Limit Reached',
        detail: `You can only select up to ${maxCandidates} ${maxCandidates === 1 ? 'candidate' : 'candidates'} for ${position.name}`,
        life: 3000
      });
      return;
    }
    currentSelections.push(candidateId);
  }
  
  selectedVotes.value = {
    ...selectedVotes.value,
    [positionId]: currentSelections
  };
  
  if (error.value && error.value.includes('only select up to') && currentSelections.length <= maxCandidates) {
    error.value = null;
  }
};

const allPositionsVoted = computed(() => {
  return positions.value.every(position => {
    const votes = selectedVotes.value[position.id] || [];
    const maxCandidates = position.max_candidate || 1;
    return votes.length > 0 && votes.length <= maxCandidates;
  });
});

const hasExceededMaxCandidates = computed(() => {
  return positions.value.some(position => {
    const selectedCount = (selectedVotes.value[position.id] || []).length;
    return selectedCount > (position.max_candidate || 1);
  });
});

const validVotedPositionsCount = computed(() => {
  return positions.value.filter(position => {
    const votes = selectedVotes.value[position.id] || [];
    const maxCandidates = position.max_candidate || 1;
    return votes.length > 0 && votes.length <= maxCandidates;
  }).length;
});

const votedPositionsCount = computed(() => {
  return positions.value.filter(position => {
    return (selectedVotes.value[position.id] || []).length > 0;
  }).length;
});

watch(
  () => hasExceededMaxCandidates.value,
  (newValue) => {
    if (newValue) {
      const invalidPosition = positions.value.find(position => {
        const selectedCount = (selectedVotes.value[position.id] || []).length;
        return selectedCount > (position.max_candidate || 1);
      });

      if (invalidPosition) {
        const maxCandidates = invalidPosition.max_candidate || 1;
        toast.add({
          severity: 'warn',
          summary: 'Selection Limit Reached',
          detail: `You can only select up to ${maxCandidates} ${maxCandidates === 1 ? 'candidate' : 'candidates'} for ${invalidPosition.name}`,
          life: 3000
        });
      }
    }
  }
);

const submitVotes = async () => {
  if (Object.keys(selectedVotes.value).length !== positions.value.length) {
    error.value = 'Please select a candidate for each position';
    return;
  }

  try {
    isSubmitting.value = true;
    
    const votes = [];
    for (const [positionId, candidateIds] of Object.entries(selectedVotes.value)) {
      for (const candidateId of candidateIds) {
        votes.push({
          election_id: parseInt(electionId),
          position: positionId,
          candidate_id: candidateId,
          voter_id: authStore.profile?.id,
          created_at: new Date().toISOString()
        });
      }
    }
    
    const results = await Promise.all(votes.map(vote => voteStore.submitVote(vote)));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await router.push(`/elections/${electionId}/confirmation`);
  } catch (err) {
    console.error('Error in submitVotes:', err);
    error.value = 'Failed to submit votes. Please try again.';
    toast.add({
      severity: 'error',
      summary: 'Submission Failed',
      detail: 'Failed to submit votes. Please try again.',
      life: 5000
    });
  } finally {
    isSubmitting.value = false;
  }
};

const fetchElectionData = async () => {
  try {
    loading.value = true;
    
    election.value = await electionStore.getElectionById(electionId);
    
    const response = await electionStore.getElectionCandidates(electionId);
    const candidatesData = response?.data || [];
    
    // Map the response to match our expected structure
    const mappedCandidates = candidatesData.map(candidate => ({
      id: candidate.id,
      name: candidate.name || `${candidate.user?.first_name || ''} ${candidate.user?.last_name || ''}`.trim(),
      avatar_url: candidate.avatar_url || candidate.user?.avatar_url || null,
      position_id: candidate.position_id,
      position: candidate.position,
      partylist: candidate.partylist, // Remove the fallback here
      user_profile: candidate.user_profile, // Add user_profile to preserve the data
      user: {
        ...candidate.user,
        first_name: candidate.user?.first_name || candidate.user_profile?.first_name || '',
        last_name: candidate.user?.last_name || candidate.user_profile?.last_name || '',
        avatar_url: candidate.avatar_url || candidate.user?.avatar_url || null,
        college: candidate.user?.college || candidate.user_profile?.college || { college_name: 'No College', alias: '' }
      },
      platform: candidate.platform || 'No platform provided',
      created_at: candidate.created_at,
      election_id: candidate.election_id,
      status: candidate.status
    }));
    
    candidates.value = mappedCandidates;
    
    const positionMap = new Map();
    const userCollegeId = authStore.profile?.college_id;
    
    try {
      const { data: positionsData } = await electionStore.getElectionPositions(electionId);
      if (positionsData && positionsData.length > 0) {
        positionsData.forEach(pos => {
          if (pos.college_can_vote === null || pos.college_can_vote === userCollegeId) {
            positionMap.set(pos.id, {
              id: pos.id,
              name: pos.title || `Position ${pos.id}`,
              order: pos.order || 0,
              max_candidate: pos.max_candidate || 1,
              ...pos
            });
          }
        });
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
    }

    if (positionMap.size === 0 && candidatesData) {
      candidatesData.forEach(candidate => {
        if (candidate.position && candidate.position.id) {
          const pos = candidate.position;
          if (pos.college_can_vote === null || pos.college_can_vote === userCollegeId) {
            if (!positionMap.has(pos.id)) {
              positionMap.set(pos.id, {
                id: pos.id,
                name: pos.title || `Position ${pos.id}`,
                order: pos.order || 0,
                max_candidate: pos.max_candidate || 1,
                ...pos
              });
            }
          }
        }
      });
    }
    
    const sortedPositions = Array.from(positionMap.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    positions.value = sortedPositions;
    
    const hasVoted = await voteStore.hasUserVoted(authStore.profile?.id, electionId);
    if (hasVoted) {
      router.push(`/elections/${electionId}/confirmation`);
      return;
    }
    
  } catch (err) {
    console.error('Error fetching election data:', err);
    error.value = 'Failed to load election data. Please try again.';
    toast.add({
      severity: 'error',
      summary: 'Loading Failed',
      detail: 'Failed to load election data. Please try again.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/elections/${electionId}/vote`);
    return;
  }
  
  fetchElectionData();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>