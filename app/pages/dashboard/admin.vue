<template>
  <div>
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