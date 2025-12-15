<template>
  <div class="px-2 sm:px-4 py-2">


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
      <div class="flex flex-col sm:flex-row justify-between gap-3 mb-4 sm:mb-3">
        <div class="mb-2 sm:mb-0">
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Elections List</h3>
          <p class="text-sm sm:text-base text-gray-600 mt-1">Browse all active and past elections managed by the student council.</p>
        </div>
        <!-- Create New Election -->
        <div class="w-full sm:w-auto">
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
      <div class="mb-6 -mx-2 sm:mx-0">
        <!-- Current Election Section -->
        <div v-if="currentElection" class="space-y-3 py-3">
          <div class="relative p-4 sm:p-6 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 mx-2 sm:mx-0">
            <!-- Current Election Badge -->
            <div class="absolute -top-3 left-6">
              <span class="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-2">
                <i class="pi pi-star-fill"></i>
                CURRENT ELECTION
              </span>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mt-2">
              <div class="flex-1">
                <div class="flex flex-col gap-2 mb-2">
                  <h2 class="text-xl sm:text-2xl font-bold text-blue-900 leading-tight">{{ currentElection.title }}</h2>
                  <p class="text-sm sm:text-base text-blue-800 font-medium">{{ currentElection.description }}</p>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-4">
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
              <div class="flex flex-wrap gap-2 lg:flex-shrink-0 mt-3 sm:mt-0">
                <NuxtLink :to="`/elections/${currentElection.id}`">
                  <Button label="View Details" icon="pi pi-eye" size="small" />
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
          <div class="px-2 sm:px-0">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div class="w-full sm:w-auto">
                <h4 class="text-base sm:text-lg font-semibold text-gray-800">Past Elections</h4>
                <p class="text-sm text-gray-500">List of previous elections</p>
              </div>
              <div class="w-full sm:w-72">
                <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText size="small" v-model="searchQuery" placeholder="Search past elections..." class="w-full" />
                </IconField>
              </div>
            </div>
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <DataTable 
                :value="filteredPastElections" 
                :paginator="true" 
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20]"
                stripedRows
                class="p-datatable-sm text-sm sm:text-base"
                :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown'"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                :paginatorDropdownAppendTo="'self'"
              >
              <Column field="title" header="Title" sortable :style="{ minWidth: '150px' }">
                <template #body="{ data }">
                  <div class="font-medium text-gray-800">{{ data.title }}</div>
                  <div class="text-xs sm:hidden text-gray-500 mt-1">
                    {{ formatDateRange(data.start_date, data.end_date, true) }}
                  </div>
                </template>
              </Column>
              
              <Column field="description" header="Description" class="hidden sm:table-cell">
                <template #body="{ data }">
                  <div class="text-sm text-gray-600 line-clamp-2">{{ data.description }}</div>
                </template>
              </Column>
              
              <Column field="start_date" header="Election Period" sortable class="hidden sm:table-cell">
                <template #body="{ data }">
                  <div class="text-sm text-gray-600 whitespace-nowrap">
                    {{ formatDateRange(data.start_date, data.end_date) }}
                  </div>
                </template>
              </Column>
              
              <Column header="Actions" :style="{ width: '120px', minWidth: '120px' }">
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
                <div class="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
                  <i class="pi pi-inbox text-5xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
                  <h3 class="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No Past Elections Found</h3>
                  <p class="text-sm text-gray-500 max-w-md mx-auto">
                    {{ searchQuery ? 'No elections match your search.' : 'There are no past elections to display at the moment.' }}
                  </p>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
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
const formatDateRange = (startDate, endDate, short = false) => {
  if (!startDate || !endDate) return 'Dates not set'
  
  const formatDate = (dateString, includeTime = true) => {
    const date = new Date(dateString)
    const options = {
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    if (!includeTime || window.innerWidth >= 640) { // sm breakpoint
      options.year = 'numeric'
    }
    
    return date.toLocaleString('en-US', options)
  }
  
  const start = formatDate(startDate, !short)
  const end = formatDate(endDate, !short)
  
  if (short) {
    return `${start} - ${end}`
  }
  
  const now = new Date()
  const startDateTime = new Date(startDate)
  const endDateTime = new Date(endDate)
  
  if (now < startDateTime) {
    return `Starts ${start}`
  } else if (now > endDateTime) {
    return `Ended ${end}`
  } else {
    return `Ends ${end}`
  }
}
</script>