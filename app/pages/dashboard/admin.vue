<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-8">
      <!-- Current Election Skeleton -->
      <div class="bg-white rounded-lg p-6 animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div class="grid grid-cols-2 gap-8">
          <div>
            <div class="h 6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div class="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-lg p-4">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Skeleton -->
      <div class="grid grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 h-80 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div class="flex justify-center mb-8">
            <div class="w-48 h-48 rounded-full bg-gray-200"></div>
          </div>
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded-md"></div>
          </div>
        </div>
        <div class="col-span-2 bg-white rounded-lg p-6 h-80 animate-pulse">
          <div class="flex justify-between items-center mb-6">
            <div class="h-6 bg-gray-200 rounded w-1/4"></div>
            <div class="flex">
              <div class="h-10 bg-gray-200 rounded-l-lg w-20"></div>
              <div class="h-10 bg-gray-100 rounded-r-lg w-20"></div>
            </div>
          </div>
          <div class="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Loaded State -->
    <template v-else>
      <!-- Current Election -->
      <CurrentElection 
        :current-election="currentElection"
        :candidates="candidates"
        :pending-candidates="pendingCandidates"
        :voters="voters"
        :positions="positions"
      />

      <!-- Statistics -->
      <div class="mt-8 mb-6 grid grid-cols-3 gap-6">
        <VotersDistribution 
          :voted-count="votes.length" 
          :total-voters="voters.length" 
        />
        <VotesOverTime />
      </div>
    </template>
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
const votes = ref([]);
const isLoading = ref(true);

// Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true;
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
  } finally {
    isLoading.value = false;
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
    // First, fetch all votes from the database
    await voteStore.fetchVotes();
    // Then filter them by election ID
    const electionVotes = voteStore.getVotesByElection(currentElection.value.id);
    votes.value = Array.isArray(electionVotes) ? electionVotes : [];
    console.log('Fetched votes:', votes.value);
  } catch (err) {
    console.error('Error in fetchVotes:', err);
    votes.value = [];
  }
};

// Fetch data when component mounts
onMounted(() => {
  fetchData();
});


</script>

<style scoped>
/* Add any custom styles here */
</style>