<template>
  <div>
    <AppBreadCrumbs :home="home" :items="items" />
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-800">My Candidacy</h1>
        <p class="text-gray-500 text-sm">View and manage your candidacy applications</p>
      </div>
      <Button
        v-if="applications.length === 0"
        label="Apply for Candidacy"
        icon="pi pi-file-edit"
        size="small"
        @click="navigateToCandidacyApplication"
      />
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading your applications...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="applications.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="pi pi-user text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
        <p class="text-gray-500 mb-6">You haven't submitted any candidacy applications yet.</p>
        <Button
          label="Apply for Candidacy"
          icon="pi pi-file-edit"
          size="small"
          @click="navigateToCandidacyApplication"
        />
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="app in applications" 
          :key="app.id" 
          class="bg-gray-50/50 rounded-lg border border-gray-200 overflow-hidden"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ app.position }}</h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ app.election?.title || 'Unknown Election' }}
                  <span v-if="app.election" class="text-gray-400 text-xs ml-2">
                    ({{ formatDate(app.election.start_date) }} - {{ formatDate(app.election.end_date) }})
                  </span>
                </p>
              </div>
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusInfo(app.status).class"
              >
                {{ getStatusInfo(app.status).text }}
              </span>
            </div>
            
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-1">Platform</h4>
              <p class="text-sm text-gray-600 line-clamp-3">{{ app.platform }}</p>
            </div>

            <div class="flex items-center mt-4">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Avatar
                  v-if="app.user?.avatar_url"
                  :image="app.user.avatar_url"
                  class="w-full h-full"
                  shape="circle"
                />
                <Avatar
                  v-else
                  :label="(app.user?.first_name?.[0] || 'U').toUpperCase()"
                  class="w-full h-full bg-gray-200 text-gray-600"
                  shape="circle"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">
                  {{ app.user?.first_name }} {{ app.user?.last_name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ app.user?.school_number || 'No ID provided' }}
                </p>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div class="text-sm text-gray-500">
                Applied on {{ formatDate(app.created_at) }}
              </div>
              <div class="flex items-center gap-2">
                <Button 
                  icon="pi pi-trash"
                  label="Cancel Application" 
                  size="small" 
                  variant="outlined"
                  @click="openCancelDialog(app.id)"
                />
                <Button 
                  icon="pi pi-eye"
                  label="View Details" 
                  size="small" 
                  @click="viewApplication(app.id)"
                />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cancel Confirmation Modal (PrimeVue Dialog) -->
    <Dialog v-model:visible="showCancelDialog" modal header="Cancel Application" :style="{ width: '28rem' }">
      <div class="flex items-start">
        <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mr-3"></i>
        <div>
          <p class="text-sm text-gray-700">Are you sure you want to delete this application? This action cannot be undone.</p>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <Button type="button" label="No, Keep" severity="secondary" size="small" @click="showCancelDialog = false" />
        <Button type="button" label="Yes, Delete" size="small" @click="handleCancelConfirmed" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCandidacyApplicationStore } from '../../../stores/candidacy_application'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'

const candidacyStore = useCandidacyApplicationStore()

const applications = ref([])
const loading = ref(true)
const error = ref(null)

const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Candidacy', icon: 'pi pi-list' },
]);

// Helper function to get status text and class
const getStatusInfo = (statusCode) => {
  const statusMap = {
    0: { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
    1: { text: 'Approved', class: 'bg-green-100 text-green-800' },
    2: { text: 'Rejected', class: 'bg-red-100 text-red-800' },
  }
  return statusMap[statusCode] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' }
}

const fetchApplications = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await candidacyStore.getUserApplications()
    
    if (fetchError) throw fetchError
    
    applications.value = data || []
    
  } catch (err) {
    console.error('Error fetching applications:', err)
    error.value = 'Failed to load your applications. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewApplication = (id) => {
  navigateTo(`/candidacy/${id}`)
}

const navigateToCandidacyApplication = () => {
  navigateTo('/candidacy/candidacy-application')
}

// Cancel application with PrimeVue Dialog confirmation
const showCancelDialog = ref(false)
const cancelTargetId = ref(null)

const openCancelDialog = (id) => {
  cancelTargetId.value = id
  showCancelDialog.value = true
}

const handleCancelConfirmed = async () => {
  if (!cancelTargetId.value) return
  try {
    const { error: deleteError } = await candidacyStore.cancelApplication(cancelTargetId.value)
    if (deleteError) throw deleteError
    // Update local list immediately
    applications.value = applications.value.filter(app => app.id !== cancelTargetId.value)
    showCancelDialog.value = false
    cancelTargetId.value = null
  } catch (err) {
    console.error('Error canceling application:', err)
    error.value = 'Failed to cancel application. Please try again.'
  }
}

// Fetch applications when component mounts
onMounted(() => {
  fetchApplications()
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})
</script>