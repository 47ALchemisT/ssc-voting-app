<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-800">My Candidacy</h1>
        <p class="text-gray-500 text-sm">View and manage your candidacy applications</p>
      </div>
      <Button
        label="Apply for Candidacy"
        icon="pi pi-plus"
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
          label="Apply Now"
          icon="pi pi-plus"
          @click="navigateToCandidacyApplication"
        />
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="app in applications" 
          :key="app.id" 
          class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                <span class="text-gray-500">{{ app.user?.first_name?.[0] || 'U' }}</span>
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
              <Button 
                label="View Details" 
                size="small" 
                text 
                @click="viewApplication(app.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCandidacyApplicationStore } from '../../../stores/candidacy_application'

const candidacyStore = useCandidacyApplicationStore()

const applications = ref([])
const loading = ref(true)
const error = ref(null)

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
  navigateTo(`/candidacy/application/${id}`)
}

const navigateToCandidacyApplication = () => {
  navigateTo('/candidacy/candidacy-application')
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