<template>
  <div>
      <!-- Current Election with Loading State -->
      <div v-if="isLoading" class="p-6 bg-white rounded-lg shadow animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-100 rounded"></div>
          <div class="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
      
      <template v-else-if="error">
        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <CurrentElection 
          :current-election="currentElection"
          :candidates="candidates"
          :pending-candidates="pendingCandidates"
          :voters="voters"
          :positions="positions"
        />
      </template>

      <!-- Statistics -->
      <div class="mt-8 mb-6 grid grid-cols-3 gap-6">
        <VotersDistribution 
          :voted-count="votes.length" 
          :total-voters="voters.length" 
        />
        <VotesOverTime 
          :votes="votes" 
          :election-id="currentElection?.id" 
          :is-loading="!currentElection"
        />
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useElectionStore } from '~~/stores/elections';
import { useCandidacyApplicationStore } from '~~/stores/candidacy_application';
import { useVotersListStore } from '~~/stores/votersList';
import { useVoteStore } from '~~/stores/votes';
import { usePositionStore } from '~~/stores/positions'; 
import CurrentElection from './components/CurrentElection.vue';
import VotersDistribution from './components/VotersDistribution.vue';
import VotesOverTime from './components/VotesOverTime.vue';

// Initialize stores
const electionStore = useElectionStore();
const candidacyApplicationStore = useCandidacyApplicationStore();
const votersListStore = useVotersListStore();
const positionStore = usePositionStore();
const voteStore = useVoteStore();

// State
const currentElection = ref(null);
const candidates = ref([]);
const pendingCandidates = ref([]);
const voters = ref([]);
const positions = ref([]);
const isLoading = ref(true);
const error = ref(null);
const votes = ref([]);

// Fetch data
const fetchData = async () => {
  try {
    const { data: electionData, error: electionError } = await electionStore.getCurrentElections();
    if (electionError) throw electionError;
    
    if (electionData && electionData.length > 0) {
      currentElection.value = electionData[0];
      
      // Fetch all data in parallel
      await Promise.all([
        fetchCandidates(),
        fetchPendingCandidates(),
        fetchVoters(),
        fetchPositions(),
        fetchVotes()
      ]);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const fetchCandidates = async () => {
  if (!currentElection.value?.id) return;
  const { data, error } = await candidacyApplicationStore.getApplicationsByElection(currentElection.value.id, 1);
  if (error) throw error;
  candidates.value = data || [];
};

const fetchPendingCandidates = async () => {
  if (!currentElection.value?.id) return;
  const { data, error } = await candidacyApplicationStore.getApplicationsByElection(currentElection.value.id, 0);
  if (error) throw error;
  pendingCandidates.value = data || [];
};

const fetchVoters = async () => {
  if (!currentElection.value?.id) return;
  const { data, error } = await votersListStore.getVotersByElection(currentElection.value.id);
  if (error) throw error;
  voters.value = data || [];
};

const fetchPositions = async () => {
  if (!currentElection.value?.id) return;
  const { data, error } = await positionStore.getPositions();
  if (error) throw error;
  positions.value = data || [];
};

const fetchVotes = async () => {
  if (!currentElection.value?.id) return;
  try {
    // First fetch all votes
    await voteStore.fetchVotes();
    
    // Use the store's method to get votes for this election
    const electionVotes = voteStore.getVotesByElection(currentElection.value.id);
    
    console.log(`Fetched ${electionVotes.length} votes for election ${currentElection.value.id}`, electionVotes);
    votes.value = electionVotes;
  } catch (err) {
    console.error('Error in fetchVotes:', err);
    votes.value = [];
  }
};

// Fetch data when component mounts
onMounted(async () => {
  try {
    await fetchData();
  } catch (err) {
    console.error('Failed to load data:', err);
    error.value = 'Failed to load election data. Please try again later.';
  } finally {
    isLoading.value = false;
  }
});


</script>

<style scoped>
/* Add any custom styles here */
</style>