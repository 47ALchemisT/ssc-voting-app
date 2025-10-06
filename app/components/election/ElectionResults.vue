<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Elections Result</h3>
          <p class="text-sm text-gray-500">Data is based on the votes casted by the students.</p>
        </div>
        <div class="flex gap-2">
            <Button 
                label="Back to Election" 
                icon="pi pi-arrow-left" 
                class="p-button-outlined" 
                size="small"
                @click="goBack" 
            />
            <ExportResults 
                :positions="positions" 
                :election-name="electionName"
                :disabled="loading || positions.length === 0"
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
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ position.title }}</h2>
            </div>
          </div>

          <div class="px-6 py-4 grid grid-cols-4 gap-10">
            <!-- Left: Candidate list -->
            <div class="col-span-2">
              <div v-for="candidate in sortedCandidates(position.candidates)" :key="candidate.id" class=" flex p-3 gap-3 rounded-lg justify-between">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 border-2 border-blue-500 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                    <img 
                      v-if="candidate.avatar_url"
                      :src="candidate.avatar_url"
                      alt="Candidate avatar"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-blue-800 font-semibold text-sm">
                      {{ (candidate.name?.charAt(0) || 'U').toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-gray-800 font-medium">{{ candidate.name }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ 
                        candidate.user_profile?.college?.college_name || 
                        (candidate.user_profile?.college || 'No college specified')
                      }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <span class="text-gray-700 font-semibold">{{ candidate.vote_count }}</span>
                  <span class="text-sm text-gray-500">votes</span>
                </div>
              </div>
            </div>

            <!-- Right: Single chart per position -->
            <div  class="col-span-2">
              <div class="h-92">
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVoteStore } from '../../../stores/votes'
import ExportResults from './ExportResults.vue'
import Chart from 'primevue/chart'

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

const resolvedElectionId = computed(() => props.electionId || route.params.id)

const loadStats = async () => {
  try {
    loading.value = true
    error.value = null
    // Fetch vote statistics
    const data = await voteStore.getVoteStatistics(resolvedElectionId.value)
    positions.value = Array.isArray(data) ? data : []
    
    // Fetch election details to get the name
    try {
      const election = await voteStore.getElectionDetails(resolvedElectionId.value)
      if (election && election.name) {
        electionName.value = election.name
      }
    } catch (e) {
      console.warn('Could not fetch election details:', e)
      // Use default name if fetch fails
      electionName.value = 'Election Results'
    }
  } catch (e) {
    console.error('Failed to load results:', e)
    error.value = e?.message || 'Failed to load results'
  } finally {
    loading.value = false
  }
}

const sortedCandidates = (cands) => {
  return [...(cands || [])].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
}

const goBack = () => {
  router.push(`/elections/${resolvedElectionId.value}`)
}

onMounted(loadStats)

// Chart helpers
const getChartData = (position) => {
  const sorted = [...(position?.candidates || [])].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
  const labels = sorted.map(c => c.name || `#${c.id}`)
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
          label: (ctx) => `${ctx.parsed.y} vote${ctx.parsed.y === 1 ? '' : 's'}`
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
