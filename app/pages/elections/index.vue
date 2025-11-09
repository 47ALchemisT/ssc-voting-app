<template>
  <div class="">


    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <Loader />
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
      <AppBreadCrumbs 
      :home="{
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/dashboard'
      }" 
      :items="[
        { label: 'Elections', icon: 'pi pi-chart-bar' }
      ]" 
    />
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
      <div class="space-y-6 mb-6">
        <!-- Current Election Section -->
        <div v-if="currentElection" class="space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-medium text-gray-700">Current Election</h4>

          </div>
          <div class="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div class="flex-1">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span class="font-medium text-xl text-blue-800">{{ currentElection.title }}</span>
                  <span v-if="currentElection.status === 'upcoming'" class="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Upcoming
                  </span>
                  <span v-else-if="currentElection.status === 'active'" class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                  <span v-else class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    Ended
                  </span>
                </div>
                <p class="text-md text-blue-700 mt-1">{{ currentElection.description }}</p>
                <div class="text-xs mt-3 flex items-center gap-2 font-medium text-blue-600">
                  <i class="pi pi-calendar"></i>
                  <span v-if="currentElection.start_date && currentElection.end_date">
                    {{ formatDateRange(currentElection.start_date, currentElection.end_date) }}
                  </span>
                  <span v-else class="text-amber-600">
                    <i class="pi pi-exclamation-circle mr-1"></i>
                    Election dates not yet set
                  </span>
                </div>
              </div>
              <div class="flex gap-2 lg:flex-shrink-0">

                <NuxtLink :to="`/elections/${currentElection.id}`">
                  <Button label="View" icon="pi pi-eye" outlined size="small" />
                </NuxtLink>
                <Button 
                  v-if="currentElection.is_current !== 1"
                  label="Results" 
                  icon="pi pi-chart-bar" 
                  outlined 
                  size="small" 
                  @click="navigateToResults(currentElection.id)"
                />
                <div v-if="authStore.isAdmin" class="flex gap-2">
                  <Button 
                    icon="pi pi-pencil" 
                    size="small" 
                    outlined 
                    @click="openEditDialog(currentElection)"
                    title="Edit Election"
                  />
                  <!--
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    outlined 
                    severity="danger"
                    @click="openDeleteDialog(currentElection)"
                    title="Delete Election"
                  />
                  -->
                </div>
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
              <div class="flex flex-col lg:flex-row lg:justify-between gap-4">
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ election.title }}</div>
                  <p class="text-sm text-gray-600 mt-3">{{ election.description }}</p>
                  <div class="text-xs font-medium mt-3 text-gray-500">
                    {{ formatDateRange(election.start_date, election.end_date) }}
                  </div>
                </div>
                <div class="flex gap-2 lg:flex-shrink-0">
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

    <!-- Create Election Modal -->
    <CreateElectionModal
      v-model:visible="showModal"
      @create="handleCreateElection"
    />

    <!-- Update Election Dialog -->
    <UpdateElectionDialog
      :visible="showUpdateDialog"
      @update:visible="(val) => showUpdateDialog = val"
      :election="selectedElection"
      @updated="handleElectionUpdated"
    />

    <!-- Delete Confirmation Dialog -->
    <DeleteElectionDialog
      :visible="showDeleteDialog"
      @update:visible="(val) => showDeleteDialog = val"
      :election="selectedElection"
      @deleted="handleElectionDeleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from "primevue/usetoast"
import { useRouter } from 'vue-router'
import CreateElectionModal from "./components/create.vue"
import UpdateElectionDialog from "./components/UpdateElectionDialog.vue"
import DeleteElectionDialog from "./components/DeleteElectionDialog.vue"
import { useElectionStore } from '../../../stores/elections'
import { useAuthStore } from '../../../stores/auth'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'
import Loader from '~/components/Loader.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

const authStore = useAuthStore();
const toast = useToast()
const router = useRouter()
const showModal = ref(false)
const showUpdateDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedElection = ref(null)


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
const { 
  fetchElections, 
  createElection, 
  updateCurrentElection, 
  deleteCurrentElection 
} = electionStore

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

// Open edit dialog for election
const openEditDialog = (election) => {
  selectedElection.value = { ...election }
  showUpdateDialog.value = true
}

// Open delete confirmation dialog
const openDeleteDialog = (election) => {
  selectedElection.value = { ...election }
  showDeleteDialog.value = true
}

// Handle election update
const handleElectionUpdated = (updatedElection) => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Election updated successfully',
    life: 3000
  })
  fetchElections()
}

// Handle election deletion
const handleElectionDeleted = () => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Election deleted successfully',
    life: 3000
  })
  fetchElections()
}

// Helper function to format date ranges with times
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Dates not set'
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const start = formatDateTime(startDate)
  const end = formatDateTime(endDate)
  
  const now = new Date()
  const startDateTime = new Date(startDate)
  const endDateTime = new Date(endDate)
  
  if (now < startDateTime) {
    return `Starts: ${start} - Ends: ${end}`
  } else if (now > endDateTime) {
    return `Ended: ${end}`
  } else {
    return `Ends: ${end}`
  }
}
</script>