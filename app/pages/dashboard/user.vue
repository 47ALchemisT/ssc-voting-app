<template>
  <div>
    <!-- Dashboard Content -->
    <div>
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">Welcome back, {{ user?.user_metadata?.name || 'Voter' }}!</h1>
            <p class="opacity-90">Your voice matters. Cast your vote in the ongoing elections.</p>
          </div>
          <button
            @click="handleSignOut"
            class="mt-4 md:mt-0 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-opacity-90 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      <!-- Active Elections -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Active Elections</h2>
          <button 
            @click="navigateTo('/elections')" 
            class="text-sm text-blue-600 hover:underline"
          >
            View All
          </button>
        </div>
        
        <div v-if="activeElections.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="election in activeElections" 
            :key="election.id"
            class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-lg">{{ election.title }}</h3>
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="election.status === 'voted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ election.status === 'voted' ? 'Voted' : 'Active' }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-4">{{ election.description }}</p>
            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>Ends {{ formatDate(election.end_date) }}</span>
              <button 
                @click="navigateTo(`/elections/${election.id}`)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {{ election.status === 'voted' ? 'View Results' : 'Vote Now' }}
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="bg-white rounded-xl p-8 text-center">
          <div class="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 002-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m4 0V5m0 0H5m2 0h2" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No active elections</h3>
          <p class="text-gray-500">There are currently no elections available for voting.</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            v-for="action in quickActions" 
            :key="action.title"
            @click="action.handler"
            class="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
          >
            <div class="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" :class="action.bgColor">
              <span class="text-xl">{{ action.icon }}</span>
            </div>
            <span class="text-sm font-medium">{{ action.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

// Page configuration
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
});

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~~/stores/auth';
import { useElectionStore } from '~~/stores/elections';
import { useVoteStore } from '~~/stores/votes';

const router = useRouter();
const authStore = useAuthStore();
const electionStore = useElectionStore();
const voteStore = useVoteStore();

// State
const user = ref({});
const activeElections = ref([]);

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Fetch data
const fetchData = async () => {
  try {
    // Fetch active elections
    const { data: elections, error: electionError } = await electionStore.getCurrentElections();
    if (electionError) throw electionError;
    
    if (elections && elections.length > 0) {
      // Check which elections the user has voted in
      const electionsWithStatus = await Promise.all(elections.map(async (election) => {
        const { data: vote, error: voteError } = await voteStore.getUserVote(election.id);
        if (voteError) console.error('Error checking vote status:', voteError);
        return {
          ...election,
          status: vote ? 'voted' : 'active'
        };
      }));
      
      activeElections.value = electionsWithStatus;
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const handleSignOut = async () => {
  try {
    await userStore.signOut();
    router.push('/auth/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

const navigateTo = (path) => {
  router.push(path);
};

// Quick actions
const quickActions = [
  {
    title: 'Vote Now',
    icon: '🗳️',
    bgColor: 'bg-blue-100',
    handler: () => navigateTo('/elections')
  },
  {
    title: 'View Results',
    icon: '📊',
    bgColor: 'bg-green-100',
    handler: () => navigateTo('/results')
  },
  {
    title: 'Election Rules',
    icon: '📜',
    bgColor: 'bg-yellow-100',
    handler: () => navigateTo('/election-rules')
  },
  {
    title: 'Help Center',
    icon: '❓',
    bgColor: 'bg-purple-100',
    handler: () => navigateTo('/help')
  },
  {
    title: 'Help Center',
    bgColor: 'bg-purple-100',
    handler: () => navigateTo('/help')
  }
];

// Lifecycle hooks
onMounted(() => {
  user.value = authStore.user || {};
  fetchData();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>