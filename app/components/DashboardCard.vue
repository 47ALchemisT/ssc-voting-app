<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">{{ value }}</p>
      </div>
      <div :class="['p-3 rounded-lg', color]">
        <span class="text-2xl">{{ icon }}</span>
      </div>
    </div>
    <div v-if="showProgress" class="mt-4">
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full" 
          :class="progressColor"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="mt-1 text-xs text-right text-gray-500">{{ progress }}% of target</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  color: {
    type: String,
    default: 'bg-blue-100'
  },
  progress: {
    type: Number,
    default: 0
  },
  showProgress: {
    type: Boolean,
    default: false
  }
})

const progressColor = computed(() => {
  if (props.progress < 30) return 'bg-red-500'
  if (props.progress < 70) return 'bg-yellow-500'
  return 'bg-green-500'
})
</script>
