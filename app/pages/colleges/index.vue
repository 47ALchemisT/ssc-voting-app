<template>
  <div>
    <AppBreadCrumbs :home="home" :items="items" />
    <Suspense>
      <!-- Default slot (main content) -->
      <template #default>
        <CollegeList />
      </template>

      <!-- Fallback slot (loading state) -->
      <template #fallback>
        <div class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
          <span class="ml-2">Loading colleges...</span>
        </div>
      </template>
    </Suspense>
  </div>
</template>
  
<script setup>
import CollegeList from './component/college-list.vue'
definePageMeta({
    middleware: 'auth',
    layout: 'dashboard-layout'
})

const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Colleges', icon: 'pi pi-list' },
]);
</script>
  