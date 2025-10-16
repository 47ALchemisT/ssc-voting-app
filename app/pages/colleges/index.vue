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
        <div class="p-6">
          <Loader />
        </div>
      </template>
    </Suspense>
  </div>
</template>
  
<script setup>
import CollegeList from './component/college-list.vue'
import Loader from '~/components/Loader.vue'
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
  