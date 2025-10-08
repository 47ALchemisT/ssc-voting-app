<template>
  <div class="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Votes Over Time</h2>
      
      <!-- Skeleton for time range toggle -->
      <div v-if="isLoading" class="inline-flex rounded-md bg-gray-200 h-10 w-48"></div>
      <div v-else class="inline-flex rounded-md" role="group">
        <button
          @click="timeRange = 'daily'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-l-lg border',
            timeRange === 'daily' 
              ? 'bg-blue-100 text-blue-700 border-blue-300' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          Daily
        </button>
        <button
          @click="timeRange = 'hourly'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-r-lg border',
            timeRange === 'hourly' 
              ? 'bg-blue-100 text-blue-700 border-blue-300' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          Hourly
        </button>
      </div>
    </div>
    <div class="h-[30rem]">
      <div v-if="isLoading" class="h-full w-full bg-gray-100 rounded animate-pulse"></div>
      <div v-else-if="error" class="h-full flex items-center justify-center text-red-500">
        {{ error }}
      </div>
      <Chart 
        v-else-if="chartData.labels && chartData.labels.length > 0"
        type="line" 
        :data="chartData" 
        :options="chartOptions" 
        class="w-full h-full" 
      />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        No voting data available
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  votes: {
    type: Array,
    default: () => []
  },
  electionId: {
    type: String,
    required: true
  }
});

const timeRange = ref('daily');
const error = ref(null);

// Process votes data for the chart
const chartData = computed(() => {
  if (!props.votes || props.votes.length === 0) return { labels: [], datasets: [] };
  
  try {
    // Votes are already filtered by election ID in the parent component
    const votes = [...props.votes];
    
    if (timeRange.value === 'daily') {
      // Group by day
      const dailyVotes = {};
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days
      
      // Initialize with 0 votes for each day
      const date = new Date(startDate);
      while (date <= endDate) {
        const dateStr = date.toISOString().split('T')[0];
        dailyVotes[dateStr] = 0;
        date.setDate(date.getDate() + 1);
      }
      
      // Count votes per day
      votes.forEach(vote => {
        if (vote.created_at) {
          const voteDate = new Date(vote.created_at).toISOString().split('T')[0];
          if (dailyVotes[voteDate] !== undefined) {
            dailyVotes[voteDate]++;
          }
        }
      });
      
      const labels = Object.keys(dailyVotes).map(date => 
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      
      return {
        labels,
        datasets: [{
          label: 'Votes',
          data: Object.values(dailyVotes),
          fill: false,
          borderColor: '#3B82F6',
          tension: 0.4
        }]
      };
    } else {
      // Group by hour
      const hourlyVotes = Array(24).fill(0);
      
      // Count votes per hour
      votes.forEach(vote => {
        if (vote.created_at) {
          const hour = new Date(vote.created_at).getHours();
          hourlyVotes[hour]++;
        }
      });
      
      const labels = hourlyVotes.map((_, i) => 
        `${i.toString().padStart(2, '0')}:00`
      );
      
      return {
        labels,
        datasets: [{
          label: 'Votes',
          data: hourlyVotes,
          fill: false,
          borderColor: '#3B82F6',
          tension: 0.4
        }]
      };
    }
  } catch (err) {
    console.error('Error processing chart data:', err);
    error.value = 'Error loading voting data';
    return { labels: [], datasets: [] };
  }
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          return `Votes: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      title: {
        display: true,
        text: () => timeRange.value === 'daily' ? 'Date' : 'Hour of Day'
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      },
      title: {
        display: true,
        text: 'Number of Votes'
      }
    }
  }
};

// Watch for changes in time range to clear any errors
watch(timeRange, () => {
  error.value = null;
});
</script>
