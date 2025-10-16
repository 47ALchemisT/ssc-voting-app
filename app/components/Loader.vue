<template>
  <div class="flex flex-col justify-center items-center h-[calc(100vh-400px)]">
    <div class="spinner"></div>
    <p class="text-gray-500 mt-3">Loading...</p>
  </div>
</template>

<style scoped>
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e5e7eb; /* light gray */
  border-top-color: #3b82f6; /* blue accent */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
