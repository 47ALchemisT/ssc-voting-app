<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">
            {{ electionStore.isElectionEnded(election) ? 'Election Results' : 'Voting Summary' }}
          </h3>
          <p class="text-sm text-gray-500">
            <span v-if="!electionStore.isElectionEnded(election)" class="text-amber-600 font-medium">
              Live results - voting is still in progress
            </span>
            <span v-else>
              Final results based on all votes cast.
            </span>
          </p>
        </div>
        <div class="flex gap-2">
            <ExportResults 
                v-if="authStore.isAdmin "
                :positions="positions" 
                :election-name="electionName"
                :disabled="loading || positions.length === 0 || !electionStore.isElectionEnded(election)"
            />
        </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading results...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center text-red-700">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <span>{{ error }}</span>
      </div>
    </div>

    <div v-else>
      <div v-if="positions.length === 0" class="text-center text-gray-600 py-12">
        No results available yet.
      </div>

      <div v-else class="space-y-6">
        <div v-for="position in positions" :key="position.id" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div v-if="!electionStore.isElectionEnded(election)" class="bg-blue-50 border-b border-blue-100 px-4 py-2 text-sm text-blue-700 flex items-center">
            <i class="pi pi-info-circle mr-2"></i>
            <span>Results are updating in real-time. These are the current vote counts.</span>
          </div>
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ position.title }}</h2>
            </div>
          </div>

          <div class="p-6">
            <!-- Vote Statistics Summary -->
            <div class="mb-6 grid grid-cols-3 gap-4">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p class="text-sm text-blue-600 font-medium mb-1">Total Votes</p>
                <p class="text-2xl font-bold text-blue-700">
                  {{ position.candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0) }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p class="text-sm text-gray-600 font-medium mb-1">Candidates</p>
                <p class="text-2xl font-bold text-gray-700">
                  {{ position.candidates.length }}
                </p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 border border-green-100">
                <p class="text-sm text-green-600 font-medium mb-1">Leading Candidate</p>
                <p class="text-lg font-bold text-green-700 truncate">
                  {{ (authStore.isAdmin || (election && electionStore.isElectionEnded(election))) ? (sortedCandidates(position.candidates)[0]?.name || 'N/A') : '?' }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left: Candidate Rankings -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Candidate Rankings</h4>
                <div v-for="candidate in sortedCandidates(position.candidates)" :key="candidate.id" 
                     class="grid grid-cols-12 gap-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-3 border border-gray-200">
                  <!-- Avatar -->
                  <div class="col-span-1 flex items-center">
                    <div class="h-10 w-10 border-2 border-blue-400 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <img 
                        v-if="candidate.avatar_url"
                        :src="candidate.avatar_url"
                        alt="Candidate avatar"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-blue-700 font-bold text-lg">
                        {{ (candidate.name?.charAt(0) || 'U').toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Info -->
                  <div class="col-span-7 flex flex-col justify-center">
                    <p class="text-gray-900 font-semibold truncate">{{ candidate.name }}</p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ candidate.college || 'No college specified' }}
                    </p>
                    <p v-if="candidate.partylist" class="text-xs text-blue-600 font-medium truncate">
                      {{ candidate.partylist }}
                    </p>
                  </div>
                  
                  <!-- Vote Count -->
                  <div class="col-span-4 flex items-center justify-end space-x-2">
                    <div class="text-right">
                      <div class="text-xl font-bold text-gray-800">
                        {{ authStore.isAdmin || (election && electionStore.isElectionEnded(election)) ? candidate.vote_count : '?' }}
                      </div>
                      <div class="text-xs text-gray-500">votes</div>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div v-if="authStore.isAdmin || (election && electionStore.isElectionEnded(election))" 
                       class="col-span-12 mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-blue-500 h-full rounded-full transition-all duration-500"
                         :style="{ width: `${getVotePercentage(position.candidates, candidate)}%` }">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Chart Visualization -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Vote Distribution</h4>
                <div class="bg-white rounded-lg border border-gray-200 p-4 h-[400px]">
                  <Chart
                    type="bar"
                    :data="getChartData(position)"
                    :options="getChartOptions()"
                    class="h-full w-full"
                  />
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVoteStore } from '../../../stores/votes'
import { useElectionStore } from '../../../stores/elections'
import ExportResults from './ExportResults.vue'
import { useAuthStore } from '../../../stores/auth'
import Chart from 'primevue/chart'

const authStore = useAuthStore()
const electionStore = useElectionStore()

const props = defineProps({
  electionId: {
    type: [String, Number],
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const voteStore = useVoteStore()

const positions = ref([])
const loading = ref(true)
const error = ref(null)
const electionName = ref('Election Results')
const election = ref(null)
const resolvedElectionId = computed(() => props.electionId || route.params.id)

const loadStats = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Fetch vote statistics
    const data = await voteStore.getVoteStatistics(resolvedElectionId.value);
    positions.value = Array.isArray(data) ? data : [];
    
    // Fetch election details using the correct store method
    try {
      const { data: electionData, error: electionError } = await electionStore.getElectionById(resolvedElectionId.value);
      
      if (electionError) throw electionError;
      
      if (electionData) {
        electionName.value = electionData.name || 'Election Results';
        election.value = electionData;
        console.log('Election data loaded:', election.value);
      }
    } catch (e) {
      console.warn('Could not fetch election details:', e);
      electionName.value = 'Election Results';
    }
  } catch (e) {
    console.error('Failed to load results:', e);
    error.value = e?.message || 'Failed to load results';
  } finally {
    loading.value = false;
  }
};

const sortedCandidates = (cands) => {
  return [...(cands || [])].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
}

const getVotePercentage = (candidates, candidate) => {
  const total = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0)
  if (total === 0) return 0
  return ((candidate.vote_count || 0) / total * 100).toFixed(1)
}

console.log('election',election.value)

onMounted(loadStats)

// Chart helpers
const getChartData = (position) => {
  const sorted = [...(position?.candidates || [])].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
  const showNames = authStore.isAdmin || (election.value && electionStore.isElectionEnded(election.value))
  const labels = sorted.map(c => showNames ? (c.name || `#${c.id}`) : 'Candidate')
  const data = sorted.map(c => c.vote_count || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Votes',
        backgroundColor: '#3B82F6', // match VoteStatistics.vue
        borderColor: '#2563EB',     // slightly darker blue for borders
        borderWidth: 1,
        data,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  }
}

const getChartOptions = () => {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            return `${ctx.parsed.y} vote${ctx.parsed.y === 1 ? '' : 's'}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#6B7280', maxRotation: 45, minRotation: 0 },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#6B7280', precision: 0 },
        grid: { color: '#E5E7EB' }
      }
    }
  }
}
</script>