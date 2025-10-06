<template>
  <div class="space-y-8">
    <!-- Welcome Section Skeleton -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 animate-pulse">
      <div class="h-8 bg-blue-400 rounded w-1/3 mb-2"></div>
      <div class="h-4 bg-blue-400 rounded w-1/2"></div>
      <div class="mt-4 w-24 h-10 bg-white bg-opacity-20 rounded-lg"></div>
    </div>

    <!-- Active Elections Skeleton -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <div class="h-6 bg-gray-200 rounded w-1/4"></div>
        <div class="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div class="h-4 bg-gray-100 rounded w-full mb-4"></div>
          <div class="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>
          <div class="flex justify-between items-center">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-8 bg-blue-100 rounded-lg w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for the skeleton
</script>
