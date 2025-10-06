<template>
  <div class="space-y-8">
    <!-- Current Election Skeleton -->
    <div class="bg-white rounded-lg p-6 animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div class="grid grid-cols-2 gap-8">
        <div>
          <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-lg p-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Skeleton -->
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white rounded-lg p-6 h-80">
        <div class="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div class="flex justify-center mb-8">
          <div class="w-48 h-48 rounded-full bg-gray-200"></div>
        </div>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded-md"></div>
        </div>
      </div>
      <div class="col-span-2 bg-white rounded-lg p-6 h-80">
        <div class="flex justify-between items-center mb-6">
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="flex">
            <div class="h-10 bg-gray-200 rounded-l-lg w-20"></div>
            <div class="h-10 bg-gray-100 rounded-r-lg w-20"></div>
          </div>
        </div>
        <div class="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for the skeleton
</script>
