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
      <Chart 
        v-else
        type="line" 
        :data="timeRange === 'daily' ? dailyVotesData : hourlyVotesData" 
        :options="votesOverTimeOptions" 
        class="w-full h-full" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

const timeRange = ref('daily');

// Votes over time data
const dailyVotesData = ref({});
const hourlyVotesData = ref({});
const votesOverTimeOptions = ref({});

// Generate dates between start and end date
const generateDateRange = (start, end) => {
  const dates = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Generate time slots for a day
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

// Generate random data for the chart
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Set up chart data
const setupChartData = () => {
  // Generate daily data (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  
  const dateLabels = generateDateRange(startDate, endDate)
    .map(date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
  dailyVotesData.value = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Votes',
        data: generateRandomData(dateLabels.length, 10, 100),
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.4
      }
    ]
  };
  
  // Generate hourly data (24 hours)
  const timeLabels = generateTimeSlots();
  hourlyVotesData.value = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Votes',
        data: generateRandomData(timeLabels.length, 5, 50),
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.4
      }
    ]
  };
  
  // Set chart options
  votesOverTimeOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
};

onMounted(() => {
  setupChartData();
});
</script>
