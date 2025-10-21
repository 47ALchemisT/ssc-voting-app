<template>
    <div>
        <!--Welcome-->
        <div>
            <h1 class="text-2xl font-semibold text-gray-800">
                {{ isAdmin ? 'Admin Dashboard' : 'Voting Dashboard' }}
            </h1>
            <p class="text-gray-500">
                Welcome{{ user?.first_name ? `, ${user.first_name}` : '' }}! {{ isAdmin ? 'Manage elections and view statistics' : 'View and participate in active elections' }}
            </p>
        </div>

        <!-- Empty State - No Election -->
        <div v-if="!currentElection" class="mt-6 bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i class="pi pi-calendar-times text-gray-400 text-4xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No current election found</h3>
            <p class="text-gray-500 mb-6">There are no active elections at the moment.</p>
            <NuxtLink 
                v-if="isAdmin" 
                to="/elections" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
                <i class="pi pi-plus mr-2"></i>
                Create Election
            </NuxtLink>
        </div>

        <div v-else>
            <div class="grid gap-6 lg:gap-8 mt-6 lg:mt-8" :class="{ 'grid-cols-1 lg:grid-cols-2': isAdmin, 'grid-cols-1': !isAdmin }">
                <!-- Left Column - Election Details -->
                <div class="flex flex-col h-full">
                    <div class="flex-1">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                                <h1 class="text-sm text-gray-500">Current Election</h1>
                                <h1 class="text-xl lg:text-2xl font-semibold text-gray-800">{{ currentElection.title }}</h1>
                            </div>
                            <div class="flex-shrink-0">
                                <Tag class="capitalize" rounded :severity="currentElection.status === 'active' ? 'success' : 'warning'" :value="currentElection.status"/>
                            </div>
                        </div>
                        <p class="text-gray-700 text-base lg:text-lg mt-2">{{ currentElection.description }}</p>
                        <div class="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 text-gray-500">
                            <span class="flex items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                Start: {{ formatDate(currentElection.start_date) }}
                            </span>
                            <span class="flex items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                End: {{ formatDate(currentElection.end_date) }}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Voting Status Card -->
                    <div class="mt-6 p-4 border rounded-lg" :class="hasVoted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'">
                        <div v-if="loadingVoteStatus" class="flex items-center justify-center py-2">
                            <i class="pi pi-spin pi-spinner text-lg text-gray-500 mr-2"></i>
                            <span>Checking vote status...</span>
                        </div>
                        <div v-else class="flex items-start">
                            <div class="flex-shrink-0">
                                <i v-if="hasVoted" class="pi pi-check-circle text-xl lg:text-2xl text-green-600 mr-3 mt-0.5"></i>
                                <i v-else class="pi pi-exclamation-circle text-xl lg:text-2xl text-blue-600 mr-3 mt-0.5"></i>
                            </div>
                            <div class="w-full">
                                <h3 class="font-medium text-sm lg:text-base" :class="hasVoted ? 'text-green-800' : 'text-blue-800'">
                                    {{ hasVoted ? 'You have already voted' : 'Your vote is pending' }}
                                </h3>
                                <div v-if="!hasVoted" class="mt-2">
                                    <p v-if="!isAdmin" class="text-sm text-blue-700 mb-2">Don't forget to cast your vote before {{ formatDate(currentElection.end_date) }}</p>
                                    <Button
                                        v-if="!isAdmin"
                                        label="Cast Vote"
                                        icon="pi pi-check-square"
                                        size="small"
                                        class="w-full sm:w-auto"
                                        @click="$router.push(`/elections/${currentElection.id}`)"
                                    />
                                    <p v-else class="text-sm text-gray-600 italic">Administrators cannot cast votes in the election.</p>
                                </div>
                                <p v-else class="text-sm mt-1 text-green-700">
                                    Thank you for participating in this election!
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Admin Stats or User Info -->
                <div v-if="isAdmin" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Admin Stats -->
                    <div class="group bg-white rounded-lg border border-gray-200 p-4 lg:p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                            <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200 text-sm lg:text-base">Total Candidates</h1>
                        </div>
                        <h1 class="text-xl lg:text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ candidates.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-4 lg:p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                            <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200 text-sm lg:text-base">Total Voters</h1>
                        </div>
                        <h1 class="text-xl lg:text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ voters.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-4 lg:p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                            <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200 text-sm lg:text-base">Pending Approvals</h1>
                        </div>
                        <h1 class="text-xl lg:text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ pendingCandidates.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-4 lg:p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                            <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200 text-sm lg:text-base">Positions</h1>
                        </div>
                        <h1 class="text-xl lg:text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ positions.length }}
                        </h1>
                    </div>
                </div>

                <!-- User Election Info -->
                <div v-else class="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Election Information</h3>
                    
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 class="font-medium text-blue-800 flex items-center mb-2">
                                <i class="pi pi-info-circle mr-2"></i>
                                How to Vote
                            </h4>
                            <ol class="text-sm text-gray-700 space-y-2 pl-4">
                                <li class="flex items-start">
                                    <span class="font-medium mr-2">1.</span>
                                    <span>Click on the <span class="font-medium">Vote Now</span> button in the Quick Actions section</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="font-medium mr-2">2.</span>
                                    <span>Review the candidates for each position</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="font-medium mr-2">3.</span>
                                    <span>Select your preferred candidate</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="font-medium mr-2">4.</span>
                                    <span>Review your selections and submit your vote</span>
                                </li>
                            </ol>
                        </div>

                        <div class="border-t border-gray-100 pt-4">
                            <h4 class="font-medium text-gray-800 mb-2">Important Dates</h4>
                            <ul class="text-sm space-y-2">
                                <li class="flex justify-between">
                                    <span class="text-gray-600">Voting Period:</span>
                                    <span class="font-medium">
                                        {{ formatDate(currentElection.start_date) }} - {{ formatDate(currentElection.end_date) }}
                                    </span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-gray-600">Results Announcement:</span>
                                    <span class="font-medium">
                                        {{ currentElection.end_date ? 
                                            formatDate(new Date(currentElection.end_date).setDate(new Date(currentElection.end_date).getDate() + 1)) : 
                                            'TBD' }}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div class="bg-gray-50 p-4 rounded-lg mt-4">
                            <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                                <i class="pi pi-question-circle mr-2"></i>
                                Need Help?
                            </h4>
                            <p class="text-sm text-gray-600 mb-2">If you have any questions or encounter any issues while voting, please contact:</p>
                            <ul class="text-sm space-y-1">
                                <li class="flex items-center">
                                    <i class="pi pi-envelope mr-2 text-gray-500"></i>
                                    <a href="mailto:election@ssc.edu" class="text-blue-600 hover:underline">election@ssc.edu</a>
                                </li>
                                <li class="flex items-center">
                                    <i class="pi pi-phone mr-2 text-gray-500"></i>
                                    <span class="text-gray-700">(123) 456-7890</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { defineProps, computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../../../../stores/auth';
import { useVoteStore } from '../../../../stores/votes';

const authStore = useAuthStore();
const voteStore = useVoteStore();
const isAdmin = computed(() => authStore.isAdmin);
const user = computed(() => authStore.user || {});
const hasVoted = ref(false);
const loadingVoteStatus = ref(true);

const props = defineProps({
  currentElection: {
    type: Object,
    default: null
  },
  candidates: {
    type: Array,
    default: () => []
  },
  pendingCandidates: {
    type: Array,
    default: () => []
  },
  voters: {
    type: Array,
    default: () => []
  },
  positions: {
    type: Array,
    default: () => []
  }
});

console.log('current election id', props.currentElection?.id);

// Check if user has voted in the current election
const checkVoteStatus = async () => {
  if (!props.currentElection?.id) {
    loadingVoteStatus.value = false;
    return;
  }
  
  try {
    hasVoted.value = await voteStore.hasCurrentUserVoted(props.currentElection.id);
  } catch (error) {
    console.error('Error checking vote status:', error);
  } finally {
    loadingVoteStatus.value = false;
  }
};

// Watch for changes in currentElection
onMounted(() => {
  checkVoteStatus();
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};


</script>