<template>
    <div class="card">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-3xl text-blue-500"></i>
        <p class="mt-2 text-gray-600">Loading vote statistics...</p>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div class="flex items-center">
          <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
          <span class="text-red-700">{{ error }}</span>
        </div>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="statistics.length === 0" class="text-center py-12 text-gray-500">
        No voting data available yet.
      </div>
  
      <!-- Carousel with Charts -->
      <Carousel 
        v-else 
        :value="statistics" 
        :numVisible="1" 
        :numScroll="1"
        :responsiveOptions="responsiveOptions"
        :circular="false"
        :showIndicators="statistics.length > 1"
        :showNavigators="statistics.length > 1"
        containerClass="custom-carousel"
      >
        <template #item="slotProps">
          <div >
            <!-- Position Header -->
            <div class="text-center mb-6">
              <h3 class="font-bold text-lg text-gray-800">{{ slotProps.data.title }}</h3>
              <p class="text-sm text-gray-500">{{ slotProps.data.candidates.length }} candidate{{ slotProps.data.candidates.length !== 1 ? 's' : '' }}</p>
            </div>
            
            <!-- Chart Container -->
            <div class="relative h-72 md:h-80">
              <Chart 
                type="bar" 
                :data="getChartData(slotProps.data)" 
                :options="getChartOptions()" 
                class="h-full w-full" 
              />
            </div>
            
            <!-- Legend/Details
            <div class="mt-6 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              <div 
                v-for="(candidate, index) in slotProps.data.candidates" 
                :key="candidate.id"
                class="flex items-center p-2 rounded-md bg-blue-50"
              >
                <div class="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate capitalize">{{ candidate.name }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ candidate.party || 'Independent' }}</div>
                </div>
                <div class="ml-2 text-right">
                  <div class="font-semibold text-blue-600">{{ candidate.vote_count }}</div>
                  <div class="text-xs text-gray-500">vote{{ candidate.vote_count !== 1 ? 's' : '' }}</div>
                </div>
              </div>
            </div> -->
          </div>
        </template>
      </Carousel>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useVoteStore } from '../../../stores/votes';
  import { usePositionStore } from '../../../stores/positions';
  import Chart from 'primevue/chart';
  
  const props = defineProps({
    electionId: {
      type: [String, Number],
      required: true
    }
  });
  
  const voteStore = useVoteStore();
  const positionStore = usePositionStore();
  const statistics = ref([]);
  const loading = ref(true);
  const error = ref(null);
  
  const responsiveOptions = ref([
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ]);
  
  const loadStatistics = async () => {
    try {
      loading.value = true;
      error.value = null;
      statistics.value = await voteStore.getVoteStatistics(props.electionId);
    } catch (err) {
      console.error('Failed to load vote statistics:', err);
      error.value = 'Failed to load vote statistics. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  
  const getChartData = (positionData) => {
    // Sort candidates by vote count for better visualization
    const sortedCandidates = [...positionData.candidates].sort((a, b) => b.vote_count - a.vote_count);
    
    return {
      labels: sortedCandidates.map(c => c.name),
      datasets: [
        {
          label: 'Votes',
          backgroundColor: '#3B82F6', // Blue color for all bars
          borderColor: '#2563EB',     // Slightly darker blue for borders
          borderWidth: 1,
          data: sortedCandidates.map(c => c.vote_count),
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };
  };
  
  const getChartOptions = () => {
    return {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Votes: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#6B7280',
            font: {
              size: 12
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6B7280',
            precision: 0
          },
          grid: {
            color: '#E5E7EB',
            drawBorder: false
          }
        }
      }
    };
  };
  
  // Position name is now included in the data from the store
  
  onMounted(() => {
    loadStatistics();
  });
  
  // Watch for electionId changes
  watch(() => props.electionId, () => {
    if (props.electionId) {
      loadStatistics();
    }
  });
  </script>
  
  <style scoped>
  </style>