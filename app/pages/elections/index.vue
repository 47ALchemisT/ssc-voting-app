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
      <div class=" mb-6">
        <!-- Current Election Section -->
        <div v-if="currentElection" class="space-y-3 py-3">
          <div class="relative p-6 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 ">
            <!-- Current Election Badge -->
            <div class="absolute -top-3 left-6">
              <span class="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-2">
                <i class="pi pi-star-fill"></i>
                CURRENT ELECTION
              </span>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mt-2">
              <div class="flex-1">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <span class="font-bold text-2xl text-blue-900">{{ currentElection.title }}</span>

                </div>
                <p class="text-base text-blue-800 mt-2 font-medium">{{ currentElection.description }}</p>
                
                <div class="flex items-center gap-2 mt-4">
                  <div class="text-sm flex items-center gap-2 font-semibold text-blue-700 bg-blue-200 px-3 py-2 rounded-lg inline-flex">
                    <i class="pi pi-calendar text-lg"></i>
                    <span v-if="currentElection.start_date && currentElection.end_date">
                      {{ formatDateRange(currentElection.start_date, currentElection.end_date) }}
                    </span>
                    <span v-else class="text-amber-700">
                      <i class="pi pi-exclamation-circle mr-1"></i>
                      Election dates not yet set
                    </span>
                  </div>
                  <div>
                    <span v-if="currentElection.status === 'upcoming'" class="px-3 py-2 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
                      <i class="pi pi-clock mr-1"></i>
                      Upcoming
                    </span>
                    <span v-else-if="currentElection.status === 'ongoing'" class="px-3 py-2 text-sm font-semibold bg-green-100 text-green-800 rounded-lg border border-green-300 animate-pulse">
                      <i class="pi pi-check-circle mr-1"></i>
                      Active Now
                    </span>
                    <span v-else class="px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg border border-gray-300">
                      <i class="pi pi-check mr-1"></i>
                      Ended
                    </span>
                  </div>
                </div>

              </div>
              <div class="flex gap-2 lg:flex-shrink-0">
                <NuxtLink :to="`/elections/${currentElection.id}`">
                  <Button label="View Details" icon="pi pi-eye" severity="info" size="small" />
                </NuxtLink>
                <Button 
                  v-if="currentElection.is_current !== 1"
                  icon="pi pi-chart-bar" 
                  severity="success"
                  size="small" 
                  v-tooltip.top="'View Results'"
                  @click="navigateToResults(currentElection.id)"
                />
                <div v-if="authStore.isAdmin" class="flex gap-2">
                  <Button 
                    icon="pi pi-pencil" 
                    size="small" 
                    v-tooltip.top="'Edit Election Info'"
                    severity="warning"
                    outlined
                    @click="openEditDialog(currentElection)"
                    title="Edit Election"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Elections Section -->
        <div v-if="pastElections.length > 0" class="space-y-3">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="text-sm font-medium text-gray-700">Past Elections</h4>
              <p class="text-sm text-gray-500">List of previous elections</p>
            </div>
            <div class="flex items-center gap-2">
              <div>
                <IconField class="w-72">
                  <InputIcon class="pi pi-search" />
                  <InputText size="small" v-model="searchQuery" placeholder="Search..." class="w-full" />
                </IconField>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <DataTable 
              :value="filteredPastElections" 
              :paginator="true" 
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20]"
              stripedRows
              class="p-datatable-sm"
            >
              <Column field="title" header="Title" sortable>
                <template #body="slotProps">
                  <span class="font-medium text-gray-800">{{ slotProps.data.title }}</span>
                </template>
              </Column>
              
              <Column field="description" header="Description">
                <template #body="slotProps">
                  <span class="text-sm text-gray-600">{{ slotProps.data.description }}</span>
                </template>
              </Column>
              
              <Column field="start_date" header="Election Period" sortable>
                <template #body="slotProps">
                  <span class="text-xs text-gray-500">
                    {{ formatDateRange(slotProps.data.start_date, slotProps.data.end_date) }}
                  </span>
                </template>
              </Column>
              
              <Column header="Actions" style="width: 200px">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <NuxtLink :to="`/elections/${slotProps.data.id}`">
                      <Button label="View" icon="pi pi-eye" outlined size="small" />
                    </NuxtLink>
                    <Button 
                      icon="pi pi-chart-bar" 
                      outlined 
                      size="small" 
                      v-tooltip.top="'View Results'"
                      @click="navigateToResults(slotProps.data.id)"
                    />
                  </div>
                </template>
              </Column>

              <template #empty>
                <div class="flex flex-col items-center justify-center py-12">
                  <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
                  <h3 class="text-lg font-medium text-gray-700 mb-2">No Past Elections Found</h3>
                  <p class="text-sm text-gray-500">There are no past elections to display at the moment.</p>
                </div>
              </template>
            </DataTable>
          </div>
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
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
const searchQuery = ref('')


// Computed properties for current and past elections
const currentElection = computed(() => {
  return elections.value.find(e => e.is_current === 1) || null
})

const pastElections = computed(() => {
  return elections.value.filter(e => e.is_current !== 1)
})

// Filtered past elections based on search query
const filteredPastElections = computed(() => {
  if (!searchQuery.value) {
    return pastElections.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return pastElections.value.filter(election => 
    election.title.toLowerCase().includes(query) ||
    election.description.toLowerCase().includes(query)
  )
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