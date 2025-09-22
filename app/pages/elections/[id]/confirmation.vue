<template>
  <div class="max-w-2xl mx-auto p-6 text-center">
    <div class="bg-white rounded-lg border border-gray-200 p-8">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-check-circle text-green-500 text-4xl"></i>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-900 mb-3">Vote Submitted Successfully!</h1>
      <p class="text-gray-600 mb-6">
        Thank you for participating in the {{ election?.title || 'election' }}. 
        Your vote has been recorded successfully.
      </p>
      
      <div class="bg-blue-50 p-4 rounded-lg text-left mb-8">
        <h3 class="font-medium text-blue-800 mb-2">Your Selections</h3>
        <ul class="space-y-3">
          <li v-for="vote in votes" :key="vote.id" class="flex justify-between">
            <span class="text-gray-700">{{ vote?.candidate?.position?.title || 'Unknown Position' }}:</span>
            <span class="font-medium text-gray-900">{{ getCandidateFullName(vote) }}</span>
          </li>
        </ul>
      </div>
      
      <div class="border-t border-gray-200 pt-6">
        <p class="text-sm text-gray-500 mb-6">
          You can view the election results once voting has ended.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            label="Back to Election" 
            icon="pi pi-arrow-left"
            class="p-button-outlined"
            @click="navigateToElection"
          />
          <Button 
            label="View Results" 
            icon="pi pi-chart-bar"
            @click="navigateToResults"
            :disabled="!isElectionEnded"
            :class="{ 'opacity-50 cursor-not-allowed': !isElectionEnded }"
          />
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

// Computed properties
const isElectionEnded = computed(() => {
  if (!election.value?.end_date) return false;
  return new Date(election.value.end_date) < new Date();
});

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
