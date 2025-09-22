<!-- components/ui/Breadcrumbs.vue -->
<template>
    <nav class="flex items-center text-xs text-gray-500">
      <NuxtLink to="/dashboard" class="hover:text-blue-600">Dashboard</NuxtLink>
  
      <template v-for="(crumb, index) in resolvedCrumbs" :key="index">
        <span class="mx-2">/</span>
  
        <template v-if="index !== resolvedCrumbs.length - 1">
          <NuxtLink :to="crumb.to" class="hover:text-blue-600">
            {{ crumb.label }}
          </NuxtLink>
        </template>
        <template v-else>
          <span class="text-gray-700 font-medium">{{ crumb.label }}</span>
        </template>
      </template>
    </nav>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    crumbs: {
      type: Array,
      default: () => []
    }
  })
  
  // Resolve dynamic labels
  const resolvedCrumbs = computed(() =>
    props.crumbs.map(crumb => ({
      ...crumb,
      label: typeof crumb.label === 'function' ? crumb.label() : crumb.label
    }))
  )
  </script>
  