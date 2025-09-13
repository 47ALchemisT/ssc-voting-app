<template>
  <div class="space-y-6">
    <!-- Current Election Highlight -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-blue-800">Current Election</h2>
      <p class="text-gray-700 mt-2">
        <span class="font-medium">SSC Student Body Election 2025</span><br>
        Voting Period: <span class="text-gray-600">Sept 10, 2025 - Sept 15, 2025</span>
      </p>
      <div class="mt-4">
        <Button label="View Details" icon="pi pi-eye" class="mr-2" />
        <Button label="Vote Now" icon="pi pi-check-circle" severity="success" />
      </div>
    </div>

    <!-- Create New Election -->
    <div class="flex justify-end">
      <Button 
        label="Create New Election"
        icon="pi pi-plus"
        severity="primary"
        class="font-semibold"
        @click="showModal = true"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading elections...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- Other Elections -->
    <div v-if="!loading">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">Other Elections</h3>
      
      <!-- No elections message -->
      <div v-if="elections.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <i class="pi pi-inbox text-3xl text-gray-400"></i>
        <p class="mt-2 text-gray-600">No elections found</p>
      </div>

      <!-- Elections list -->
      <ul v-else class="space-y-3">
        <li 
          v-for="election in elections" 
          :key="election.id"
          class="p-4 rounded-lg bg-gray-50 flex justify-between items-center"
        >
          <div>
            <div class="font-medium">{{ election.title }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ election.description }}</div>
            <div class="text-sm text-gray-500">
              {{ formatDateRange(election.start_date, election.end_date) }}
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <NuxtLink :to="'/elections/' + election.id + '/candidates'">
              <Button 
                label="Candidates" 
                icon="pi pi-users" 
                outlined 
                size="small"
                class="mb-2 sm:mb-0"
              />
            </NuxtLink>
            <NuxtLink :to="'/elections/' + election.id">
              <Button 
                label="Details" 
                icon="pi pi-eye" 
                outlined 
                size="small" 
                class="mb-2 sm:mb-0"
              />
            </NuxtLink>
            <Button 
              label="Results" 
              icon="pi pi-chart-bar" 
              outlined 
              size="small" 
              @click="navigateToResults(election.id)"
              class="mb-2 sm:mb-0"
            />
          </div>
        </li>
      </ul>
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
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import CreateElectionModal from './components/create.vue'
import { useElections } from '~/composables/useElections'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

const toast = useToast()
const router = useRouter()
const showModal = ref(false)

// Use the elections composable
const { 
  elections, 
  loading, 
  error, 
  fetchElections, 
  createElection 
} = useElections()

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
  router.push('/elections/' + electionId + '/results')
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
    return 'Upcoming: ' + start + ' - ' + end
  } else if (now > endDateTime) {
    return 'Ended: ' + end
  } else {
    return 'Active: ' + start + ' - ' + end
  }
}
</script>
