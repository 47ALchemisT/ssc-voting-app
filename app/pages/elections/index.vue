<template>
  <div class="">


    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading elections...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- Other Elections -->
    <div v-if="!loading">
      <AppBreadCrumbs :home="home" :items="items" />
      <div class="flex justify-between mb-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Elections List</h3>
          <p class="text-sm text-gray-500">Browse all active and past elections managed by the student council.</p>
        </div>
        <!-- Create New Election -->
        <div>
          <Button 
            v-if="authStore.isAdmin && !hasActiveElections"
            label="Create New Election"
            icon="pi pi-plus"
            severity="primary"
            size="small"
            class="font-semibold"
            @click="showModal = true"
          />
        </div>
      </div>

      <!-- No elections message -->
      <div v-if="elections.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <i class="pi pi-inbox text-3xl text-gray-400"></i>
        <p class="mt-2 text-gray-600">No elections found</p>
      </div>

      <!-- Elections list -->
      <div class="space-y-6">
        <!-- Current Election Section -->
        <div v-if="currentElection" class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700">Current Election</h4>
          <div class="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-blue-800">{{ currentElection.title }}</span>
                  <span class="px-2 py-0.5 mt-3 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Current Election
                  </span>
                </div>
                <p class="text-sm text-blue-700 mt-1">{{ currentElection.description }}</p>
                <div class="text-xs mt-3 font-medium text-blue-600">
                  {{ formatDateRange(currentElection.start_date, currentElection.end_date) }}
                </div>
              </div>
              <div class="flex gap-2">
                <NuxtLink :to="`/elections/${currentElection.id}`">
                  <Button label="View" icon="pi pi-eye" outlined size="small" />
                </NuxtLink>
                <Button 
                  label="Results" 
                  icon="pi pi-chart-bar" 
                  outlined 
                  size="small" 
                  @click="navigateToResults(currentElection.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Past Elections Section -->
        <div v-if="pastElections.length > 0" class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700">Past Elections</h4>
          <ul class="space-y-3">
            <li 
              v-for="election in pastElections" 
              :key="election.id"
              class="p-4 rounded-lg border border-gray-200 bg-white bg-gray-50/50"
            >
              <div class="flex justify-between gap-10">
                <div>
                  <div class="font-medium text-gray-800">{{ election.title }}</div>
                  <p class="text-sm text-gray-600 mt-3">{{ election.description }}</p>
                  <div class="text-xs font-medium mt-3 text-gray-500">
                    {{ formatDateRange(election.start_date, election.end_date) }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <NuxtLink :to="`/elections/${election.id}`">
                    <Button label="View" icon="pi pi-eye" outlined size="small" />
                  </NuxtLink>
                  <div>
                    <Button 
                      label="Results" 
                      icon="pi pi-chart-bar" 
                      outlined 
                      size="small" 
                      @click="navigateToResults(election.id)"
                    />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <Toast />

    <!-- Modal -->
    <CreateElectionModal
      v-model:visible="showModal"
      @create="handleCreateElection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from "primevue/usetoast"
import { useRouter } from 'vue-router'
import CreateElectionModal from "./components/create.vue"
import { useElectionStore } from '../../../stores/elections'
import { useAuthStore } from '../../../stores/auth'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

const authStore = useAuthStore();
const toast = useToast()
const router = useRouter()
const showModal = ref(false)

const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Elections', icon: 'pi pi-chart-bar', route: '/elections' }
]);

// Computed properties for current and past elections
const currentElection = computed(() => {
  return elections.value.find(e => e.is_current === 1) || null
})

const pastElections = computed(() => {
  return elections.value.filter(e => e.is_current !== 1)
})

// Check if there are any active elections
const hasActiveElections = computed(() => {
  return elections.value.some(election => 
    electionStore.isElectionActive(election)
  )
})

// Use the elections store
const electionStore = useElectionStore()
const { elections, loading, error } = storeToRefs(electionStore)
const { fetchElections, createElection } = electionStore

// Fetch elections on component mount
onMounted(() => {
  fetchElections()
})

// Handle election creation
const handleCreateElection = async (data) => {
  try {
    const result = await createElection(data)
    
    if (result.error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result.error,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Election created successfully!',
        life: 3000
      })
      // Optionally refresh the list
      await fetchElections()
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create election',
      life: 5000
    })
  }
}

// Navigation
const navigateToResults = (electionId) => {
  router.push(`/elections/${electionId}/results`)
}

// Helper function to format date ranges
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Dates not set'
  
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  
  const now = new Date()
  const startDateTime = new Date(startDate)
  const endDateTime = new Date(endDate)
  
  if (now < startDateTime) {
    return `Upcoming: ${start} - ${end}`
  } else if (now > endDateTime) {
    return `Ended: ${end}`
  } else {
    return `Schedule: ${start} - ${end}`
  }
}
</script>