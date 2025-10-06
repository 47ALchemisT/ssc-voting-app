<template>
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex flex-col">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Voters Distribution</h2>
        
        <!-- Skeleton Loader -->
        <div v-if="isLoading" class="animate-pulse">
          <div class="flex justify-center mb-8">
            <div class="w-64 h-64 rounded-full bg-gray-200"></div>
          </div>
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-md"></div>
          </div>
        </div>
        <div v-else class="w-full flex justify-center mb-8">
          <div class="w-64 h-64">
            <Chart type="pie" :data="chartData" :options="chartOptions" class="w-full h-full" />
          </div>
        </div>
        
        <!-- Summary Stats -->
        <div class="w-full max-w-md space-y-3">
          <div class="flex justify-between items-center py-2 px-3 bg-gray-100/80 rounded-md">
            <div class="flex items-center">
              <span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              <span class="text-gray-600">Voted</span>
            </div>
            <div class="text-right">
              <div class="font-medium">{{ votedCount }}</div>
              <div class="text-sm text-gray-500">{{ votedPercentage }}% of total</div>
            </div>
          </div>
          
          <div class="flex justify-between items-center py-2 px-3 bg-gray-100/80 rounded-md">
            <div class="flex items-center">
              <span class="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
              <span class="text-gray-600">Not Voted</span>
            </div>
            <div class="text-right">
              <div class="font-medium">{{ notVotedCount }}</div>
              <div class="text-sm text-gray-500">{{ notVotedPercentage }}% of total</div>
            </div>
          </div>
          
          <div class="flex justify-between items-center py-3 px-3 bg-gray-100/80 rounded-md">
            <span class="font-medium">Total Registered Voters</span>
            <span class="font-semibold">{{ totalVoters }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    votedCount: {
      type: Number,
      default: 0
    },
    totalVoters: {
      type: Number,
      default: 0
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  });
  
  const notVotedCount = computed(() => props.totalVoters - props.votedCount);
  const votedPercentage = computed(() => {
    return props.totalVoters > 0 ? ((props.votedCount / props.totalVoters) * 100).toFixed(2) : 0;
  });
  const notVotedPercentage = computed(() => {
    return props.totalVoters > 0 ? ((notVotedCount.value / props.totalVoters) * 100).toFixed(2) : 0;
  });
  
  const chartData = computed(() => ({
    labels: ['Voted', 'Not Voted'],
    datasets: [
      {
        data: [props.votedCount, notVotedCount.value],
        backgroundColor: ['#3B82F6', '#E5E7EB'],
        hoverBackgroundColor: ['#2563EB', '#D1D5DB']
      }
    ]
  }));
  
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%'
  };
  </script>