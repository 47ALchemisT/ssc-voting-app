<template>
    <div>
        <!-- Welcome Header -->
        <div class="mb-4 md:mb-6 lg:mb-8">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {{ isAdmin ? 'Admin Dashboard' : 'Voting Dashboard' }}
            </h1>
            <p class="text-base sm:text-lg text-gray-600">
                Welcome{{ user?.first_name ? `, ${user.first_name}` : '' }}! 
                <span class="hidden sm:inline">{{ isAdmin ? 'Manage elections and view statistics' : 'View and participate in active elections' }}</span>
            </p>
        </div>

        <!-- Empty State - No Election -->
        <div v-if="!currentElection" class="mt-4 sm:mt-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 p-6 sm:p-8 md:p-12 text-center">
            <div class="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <i class="pi pi-calendar-times text-gray-400 text-4xl sm:text-5xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No Current Election</h3>
            <p class="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base md:text-lg">
                There are no active elections at the moment. Check back later or create a new election to get started.
            </p>
            <NuxtLink 
                v-if="isAdmin" 
                to="/elections" 
                class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
            >
                <i class="pi pi-plus mr-2"></i>
                Create Election
            </NuxtLink>
        </div>

        <div v-else>
            <div class="grid gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8" :class="{ 'lg:grid-cols-2': isAdmin }">
                <!-- Left Column - Election Details -->
                <div class="flex flex-col h-full">
                    <!-- Main Election Card -->
                    <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-200 transition-shadow duration-300 overflow-hidden">
                        <!-- Gradient Header -->
                        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                                <div class="flex-1">
                                    <p class="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wide mb-1">Current Election</p>
                                    <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">{{ currentElection.title }}</h1>
                                </div>
                                <div class="flex-shrink-0 mt-2 sm:mt-0">
                                    <Tag 
                                        class="capitalize !text-xs sm:!text-sm !px-3 !py-1 sm:!px-4 sm:!py-2" 
                                        rounded 
                                        :severity="currentElection.status === 'active' ? 'success' : 'warning'" 
                                        :value="currentElection.status"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="p-4 sm:p-6">
                            <p class="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4">
                                {{ currentElection.description }}
                            </p>
                            
                            <!-- Date Info -->
                            <div class="grid grid-cols-1 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                                <div class="flex items-start space-x-2 sm:space-x-3 bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                    <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i class="pi pi-calendar-plus text-blue-600 text-sm sm:text-base"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-600 font-medium uppercase tracking-wide">Start Date</p>
                                        <p class="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 sm:mt-1">
                                            {{ formatDate(currentElection.start_date) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-2 sm:space-x-3 bg-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                    <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <i class="pi pi-calendar-minus text-red-600 text-sm sm:text-base"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-600 font-medium uppercase tracking-wide">End Date</p>
                                        <p class="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 sm:mt-1">
                                            {{ formatDate(currentElection.end_date) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Voting Status Card -->
                    <div class="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl overflow-hidden border-2" 
                         :class="hasVoted ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'">
                        <div v-if="loadingVoteStatus" class="flex items-center justify-center py-6 sm:py-8">
                            <i class="pi pi-spin pi-spinner text-xl sm:text-2xl text-gray-500 mr-2 sm:mr-3"></i>
                            <span class="text-base sm:text-lg text-gray-700">Checking vote status...</span>
                        </div>
                        <div v-else class="p-4 sm:p-6">
                            <div class="flex items-start">
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" 
                                         :class="hasVoted ? 'bg-blue-500' : 'bg-blue-500'">
                                        <i v-if="hasVoted" class="pi pi-check-circle text-2xl sm:text-3xl text-white"></i>
                                        <i v-else class="pi pi-exclamation-circle text-2xl sm:text-3xl text-white"></i>
                                    </div>
                                </div>
                                <div class="ml-3 sm:ml-4 flex-1">
                                    <h3 class="text-lg sm:text-xl font-bold mb-1 sm:mb-2" 
                                        :class="hasVoted ? 'text-blue-900' : 'text-blue-900'">
                                        {{ hasVoted ? 'Vote Successfully Cast' : 'Your Vote is Pending' }}
                                    </h3>
                                    <div v-if="!hasVoted">
                                        <p v-if="!isAdmin" class="text-xs sm:text-sm text-blue-800 mb-3 sm:mb-4 font-medium">
                                            Don't miss out! Cast your vote before 
                                            <span class="font-bold whitespace-nowrap">{{ formatDate(currentElection.end_date) }}</span>
                                        </p>
                                        <Button
                                            v-if="!isAdmin"
                                            label="Cast Your Vote Now"
                                            icon="pi pi-check-square"
                                            iconPos="right"
                                            size="small"
                                            class="w-full !text-xs sm:!text-sm !py-2 !bg-blue-600 hover:!bg-blue-700 !border-blue-600 transition-all duration-200 transform hover:scale-105"
                                            @click="$router.push(`/elections/${currentElection.id}`)"
                                        />
                                        <p v-else class="text-xs sm:text-sm text-gray-600 italic bg-white/60 p-2 sm:p-3 rounded-lg">
                                            <i class="pi pi-info-circle mr-1 sm:mr-2"></i>
                                            Administrators cannot cast votes in elections.
                                        </p>
                                    </div>
                                    <div v-else class="bg-white/60 p-3 sm:p-4 rounded-lg">
                                        <p class="text-xs sm:text-sm font-medium text-blue-800 flex items-center">
                                            <i class="pi pi-check-circle text-green-500 mr-1 sm:mr-2"></i>
                                            You've successfully cast your vote on {{ formatDate(voteTimestamp) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Admin Stats or User Info -->
                <div v-if="isAdmin" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <!-- Admin Stats Cards -->
                    <div class="group bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-blue-500 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-1.5">
                        <div class="flex items-center justify-between mb-3 sm:mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                                <i class="pi pi-users text-blue-600 text-xl sm:text-2xl group-hover:text-white transition-colors duration-300"></i>
                            </div>
                        </div>
                        <h3 class="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Total Candidates</h3>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {{ candidates.length }}
                        </p>
                    </div>

                    <div class="group bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-blue-500 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-1.5">
                        <div class="flex items-center justify-between mb-3 sm:mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                                <i class="pi pi-user-plus text-blue-600 text-xl sm:text-2xl group-hover:text-white transition-colors duration-300"></i>
                            </div>
                        </div>
                        <h3 class="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Total Voters</h3>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {{ voters.length }}
                        </p>
                    </div>

                    <div class="group bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-blue-500 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-1.5">
                        <div class="flex items-center justify-between mb-3 sm:mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                                <i class="pi pi-clock text-blue-600 text-xl sm:text-2xl group-hover:text-white transition-colors duration-300"></i>
                            </div>
                        </div>
                        <h3 class="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Pending Approvals</h3>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {{ pendingCandidates.length }}
                        </p>
                    </div>

                    <div class="group bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-blue-500 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-1.5">
                        <div class="flex items-center justify-between mb-3 sm:mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                                <i class="pi pi-briefcase text-blue-600 text-xl sm:text-2xl group-hover:text-white transition-colors duration-300"></i>
                            </div>
                        </div>
                        <h3 class="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Positions</h3>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {{ positions.length }}
                        </p>
                    </div>
                </div>

                <!-- User Election Info -->
                <div v-else class="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
                    <div class="flex items-center mb-6">
                        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                            <i class="pi pi-info-circle text-blue-600 text-2xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900">Election Guide</h3>
                    </div>
                    
                    <div class="space-y-6">
                        <!-- How to Vote Section -->
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                            <h4 class="font-bold text-blue-900 flex items-center mb-4 text-lg">
                                <i class="pi pi-list-check mr-3 text-xl"></i>
                                How to Vote
                            </h4>
                            <ol class="space-y-3">
                                <li class="flex items-start bg-white/60 p-3 rounded-lg">
                                    <span class="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">1</span>
                                    <span class="text-gray-800">Click on the <span class="font-bold text-blue-700">Cast Your Vote Now</span> button above</span>
                                </li>
                                <li class="flex items-start bg-white/60 p-3 rounded-lg">
                                    <span class="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">2</span>
                                    <span class="text-gray-800">Review all candidates and their platforms carefully</span>
                                </li>
                                <li class="flex items-start bg-white/60 p-3 rounded-lg">
                                    <span class="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">3</span>
                                    <span class="text-gray-800">Select your preferred candidate for each position</span>
                                </li>
                                <li class="flex items-start bg-white/60 p-3 rounded-lg">
                                    <span class="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">4</span>
                                    <span class="text-gray-800">Review your selections and submit your final vote</span>
                                </li>
                            </ol>
                        </div>

                        <!-- Important Dates -->
                        <div class="border-2 border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-50">
                            <h4 class="font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg flex items-center">
                                <i class="pi pi-calendar mr-2 sm:mr-3 text-lg sm:text-xl text-gray-700"></i>
                                Important Dates
                            </h4>
                            <div class="space-y-2 sm:space-y-3">
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                                    <span class="text-sm sm:text-base text-gray-700 font-medium mb-1 sm:mb-0">Voting Period:</span>
                                    <div class="text-right">
                                        <div class="text-sm sm:text-base font-bold text-gray-900">From : {{ formatDate(currentElection.start_date, true) }}</div>
                                        <div class="text-sm sm:text-base font-bold text-gray-900"> To : {{ formatDate(currentElection.end_date, true) }}</div>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                                    <span class="text-sm sm:text-base text-gray-700 font-medium mb-1 sm:mb-0">Results Announcement:</span>
                                    <span class="text-sm sm:text-base font-bold text-gray-900">
                                        {{ currentElection.end_date ? 
                                            formatDate(new Date(currentElection.end_date).setDate(new Date(currentElection.end_date).getDate() + 1), true) : 
                                            'TBD' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Help Section -->
                        <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                            <h4 class="font-bold text-amber-900 mb-4 flex items-center text-lg">
                                <i class="pi pi-question-circle mr-3 text-xl"></i>
                                Need Help?
                            </h4>
                            <p class="text-sm text-gray-700 mb-4">If you have any questions or encounter issues while voting, please contact:</p>
                            <div class="space-y-3">
                                <a href="mailto:election@ssc.edu" class="flex items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-all group">
                                    <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-200 transition-colors">
                                        <i class="pi pi-envelope text-amber-600 text-lg"></i>
                                    </div>
                                    <span class="text-blue-600 hover:underline font-medium">election@ssc.edu</span>
                                </a>
                                <div class="flex items-center bg-white p-3 rounded-lg">
                                    <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                        <i class="pi pi-phone text-amber-600 text-lg"></i>
                                    </div>
                                    <span class="text-gray-800 font-medium">(123) 456-7890</span>
                                </div>
                            </div>
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