<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Success Animation Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <!-- Success Header with Animation -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div class="relative z-10">
            <!-- Animated Success Icon -->
            <div class="relative inline-block mb-6">
              <div class="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
              <div class="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <i class="pi pi-check-circle text-blue-500 text-5xl"></i>
              </div>
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Vote Submitted Successfully!
            </h1>
            <p class="text-blue-50 text-lg max-w-lg mx-auto">
              Thank you for participating in <span class="font-semibold">{{ election?.title || 'the election' }}</span>
            </p>
          </div>
          
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
        </div>

        <!-- Confirmation Message -->
        <div class="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-info-circle text-blue-600 text-xl"></i>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Your vote has been securely recorded</h3>
              <p class="text-sm text-gray-600">
                Your selections are confidential and cannot be changed. You can view the results once voting has ended.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Voting Summary -->
        <div class="px-8 py-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Your Selections</h3>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <i class="pi pi-clock"></i>
              <span>{{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
            </div>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(position, index) in getGroupedAndSortedPositions()" 
              :key="position.id" 
              class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <!-- Position Header -->
              <div class="flex items-center space-x-3 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  {{ index + 1 }}
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 text-lg">{{ position.title || 'Unknown Position' }}</h4>
                  <p class="text-xs text-gray-500">{{ getVotesForPosition(position.id).length }} {{ getVotesForPosition(position.id).length === 1 ? 'vote cast' : 'votes cast' }}</p>
                </div>
              </div>
              
              <!-- Candidates List -->
              <div class="space-y-3 ml-13">
                <div 
                  v-for="vote in getVotesForPosition(position.id)" 
                  :key="vote.id" 
                  class="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-semibold text-sm">
                        {{ getInitials(getCandidateFullName(vote)) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ getCandidateFullName(vote) }}</p>
                      <p class="text-xs text-gray-500">{{ vote?.candidate?.partylist?.name || 'Independent' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                      <i class="pi pi-check text-xs mr-1.5"></i>
                      Voted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="py-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading your vote summary...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && votes.length === 0" class="py-12 text-center">
            <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">No votes found</p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              label="Back to Election" 
              icon="pi pi-arrow-left"
              class="p-button-outlined flex-1 sm:flex-initial"
              @click="navigateToElection"
            />
            <Button 
              label="View Results" 
              icon="pi pi-chart-bar"
              iconPos="right"
              class="flex-1 sm:flex-initial"
              @click="navigateToResults"
              :disabled="!isElectionEnded"
              :class="{ 'opacity-50 cursor-not-allowed': !isElectionEnded }"
            />
          </div>
          
          <p v-if="!isElectionEnded" class="text-center text-xs text-gray-500 mt-4">
            <i class="pi pi-lock text-xs mr-1"></i>
            Results will be available after {{ election?.end_date ? new Date(election.end_date).toLocaleDateString() : 'voting ends' }}
          </p>
        </div>
      </div>

      <!-- Additional Info Card -->
      <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <i class="pi pi-shield text-amber-600"></i>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-2">Vote Security & Privacy</h4>
            <ul class="space-y-1 text-sm text-gray-600">
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 text-xs mr-2 mt-0.5"></i>
                <span>Your vote is encrypted and securely stored</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 text-xs mr-2 mt-0.5"></i>
                <span>All votes remain confidential throughout the process</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 text-xs mr-2 mt-0.5"></i>
                <span>Results will be published after the election period ends</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
const votes = ref([]);
const positions = ref([]);
const candidates = ref([]);
const loading = ref(true);

// Group and sort votes by position order
const getGroupedAndSortedPositions = () => {
  // Get unique positions from votes
  const positionMap = new Map();
  
  votes.value.forEach(vote => {
    if (vote?.candidate?.position) {
      const pos = vote.candidate.position;
      if (!positionMap.has(pos.id)) {
        positionMap.set(pos.id, { ...pos });
      }
    }
  });
  
  // Convert to array and sort by order
  return Array.from(positionMap.values()).sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );
};

// Get votes for a specific position
const getVotesForPosition = (positionId) => {
  return votes.value.filter(vote => 
    vote?.candidate?.position?.id === positionId
  );
};

// Computed properties
const isElectionEnded = computed(() => {
  if (!election.value?.end_date) return false;
  return new Date(election.value.end_date) < new Date();
});

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getCandidateFullName = (vote) => {
  const user = vote?.candidate?.user;
  if (!user) return 'Unknown Candidate';
  const first = user.first_name || '';
  const last = user.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || 'Unknown Candidate';
};

const navigateToElection = () => {
  router.push(`/elections/${electionId}`);
};

const navigateToResults = () => {
  if (isElectionEnded.value) {
    router.push(`/elections/${electionId}/results`);
  }
};

// Fetch data
const fetchData = async () => {
  try {
    loading.value = true;
    
    // Fetch election details
    election.value = await electionStore.getElectionById(electionId);
    
    // Fetch user's votes
    const userVotes = await voteStore.getUserVotes(authStore.profile?.id, electionId);
    votes.value = userVotes;
    
    // Optionally fetch candidates for any additional display needs
    candidates.value = await electionStore.getElectionCandidates(electionId);
    
  } catch (error) {
    console.error('Error loading confirmation data:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/elections/${electionId}/vote/confirmation`);
    return;
  }
  
  fetchData();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
