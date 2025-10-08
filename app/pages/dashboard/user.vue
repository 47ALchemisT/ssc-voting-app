<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="p-6 bg-white rounded-lg shadow animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div class="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-100 rounded"></div>
        <div class="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

    <!-- Current Election -->
    <template v-else>
      <CurrentElection 
        :current-election="currentElection"
        :candidates="candidates"
        :pending-candidates="[]"
        :voters="[]"
        :positions="[]"
        class="mb-6"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~~/stores/auth';
import { useElectionStore } from '~~/stores/elections';
import { useCandidacyApplicationStore } from '~~/stores/candidacy_application';
import { useVoteStore } from '~~/stores/votes';
import CurrentElection from './components/CurrentElection.vue';

const router = useRouter();
const authStore = useAuthStore();
const electionStore = useElectionStore();
const candidacyApplicationStore = useCandidacyApplicationStore();
const voteStore = useVoteStore();

// State
const user = ref({});
const currentElection = ref(null);
const candidates = ref([]);
const activeElections = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Fetch current election
    const { data: elections, error: electionError } = await electionStore.getCurrentElections();
    if (electionError) throw electionError;
    
    if (elections && elections.length > 0) {
      currentElection.value = elections[0];
      
      // Fetch candidates for the current election
      if (currentElection.value?.id) {
        const { data: candidatesData, error: candidatesError } = 
          await candidacyApplicationStore.getApplicationsByElection(currentElection.value.id, 1);
        if (candidatesError) throw candidatesError;
        candidates.value = candidatesData || [];
      }
      
      // Check which elections the user has voted in
      const electionsWithStatus = await Promise.all(elections.map(async (election) => {
        const hasVoted = await voteStore.hasCurrentUserVoted(election.id);
        return {
          ...election,
          status: hasVoted ? 'voted' : 'active'
        };
      }));
      
      activeElections.value = electionsWithStatus;
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load election data. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const navigateTo = (path) => {
  router.push(path);
};

// Quick actions
const quickActions = [
  {
    title: 'Vote Now',
    description: 'Cast your vote in active elections',
    icon: '🗳️',
    bgColor: 'bg-blue-50',
    handler: () => navigateTo('/elections')
  },
  {
    title: 'View Results',
    description: 'See current election results',
    icon: '📊',
    bgColor: 'bg-green-50',
    handler: () => navigateTo('/results')
  },
  {
    title: 'Election Rules',
    description: 'Review voting guidelines',
    icon: '📜',
    bgColor: 'bg-yellow-50',
    handler: () => navigateTo('/election-rules')
  },
  {
    title: 'Help Center',
    description: 'Get assistance with voting',
    icon: '❓',
    bgColor: 'bg-purple-50',
    handler: () => navigateTo('/help')
  }
];

// Lifecycle hooks
onMounted(async () => {
  try {
    user.value = authStore.user || {};
    await fetchData();
  } catch (err) {
    console.error('Error in component mount:', err);
    error.value = 'An error occurred while initializing the dashboard.';
  }
});
</script>

<style scoped>
/* Add any custom styles here */
</style>