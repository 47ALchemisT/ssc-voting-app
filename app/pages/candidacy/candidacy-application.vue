<template>
  <div>
    <div class="mb-8">
      <h1 class="text-xl font-medium text-gray-800">Candidacy Application</h1>
      <p class="text-gray-500 text-sm">Submit your application to run for a position in the upcoming election</p>
    </div>

    <div class="max-w-2xl mx-auto">
        <!-- User Information Section -->
        <div v-if="authStore.user && authStore.profile" class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <p class="text-sm text-gray-500">Full Name</p>
            <p class="text-gray-900 capitalize font-medium">
                {{ authStore.profile.first_name }} 
                {{ authStore.profile.middle_name ? authStore.profile.middle_name + ' ' : '' }}
                {{ authStore.profile.last_name }}
            </p>
            </div>
            <div>
            <p class="text-sm text-gray-500">School Number</p>
            <p class="text-gray-900 font-medium">{{ authStore.profile.school_number || 'N/A' }}</p>
            </div>
            <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="text-gray-900 font-medium">{{ authStore.user.email }}</p>
            </div>
            <div>
            <p class="text-sm text-gray-500">Account Status</p>
            <p class="text-gray-900 font-medium">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
                </span>
            </p>
            </div>
        </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p class="mt-2 text-gray-600">Loading election details...</p>
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

        <form v-else @submit.prevent="submitApplication" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Election Selection -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Election</label>
                <Dropdown
                v-model="selectedElection"
                :options="elections"
                option-label="title"
                option-value="id"
                placeholder="Select an election"
                class="w-full"
                :disabled="!!electionId"
                />
            </div>

            <!-- Position Selection -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Dropdown
                  v-model="form.position"
                  :options="positionStore.positions || []"
                  option-label="title"
                  option-value="id"
                  placeholder="Select a position"
                  class="w-full"
                  :class="{ 'p-invalid': errors.position }"
                  :loading="positionStore.loading"
                  :disabled="positionStore.loading"
                />
                <small v-if="errors.position" class="p-error">{{ errors.position }}</small>
            </div>

            <!-- Platform -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Your Platform</label>
                <Textarea
                v-model="form.platform"
                rows="5"
                placeholder="Describe your platform and why you're running for this position..."
                class="w-full"
                :class="{ 'p-invalid': errors.platform }"
                />
                <small v-if="errors.platform" class="p-error">{{ errors.platform }}</small>
            </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
            <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="$router.back()"
            />
            <Button
                type="submit"
                label="Submit Application"
                :loading="submitting"
                :disabled="submitting"
            />
            </div>
        </form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { useCandidacyApplicationStore } from '../../../stores/candidacy_application'
import { useElectionStore } from '../../../stores/elections'
import { usePositionStore } from '../../../stores/positions'  

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

const route = useRoute()
const authStore = useAuthStore()
const candidacyStore = useCandidacyApplicationStore()
const electionStore = useElectionStore()
const positionStore = usePositionStore()

// Ensure user profile is loaded
const loadUserProfile = async () => {
  if (!authStore.profile) {
    await authStore.fetchProfile()
  }
}
const loadPositions = async () => {
  try {
    await positionStore.getPositions()
  } catch (error) {
    console.error('Failed to load positions:', error)
  }
}

// Load user profile on component mount
onMounted(() => {
  loadUserProfile()
})

const electionId = ref(route.query.electionId || null)
const elections = ref([])
const selectedElection = ref(electionId.value)
const loading = ref(true)
const submitting = ref(false)
const error = ref(null)

const form = ref({
  position: null,
  platform: ''
})

const errors = ref({})

// Available positions (you can fetch these from your API if needed)
const availablePositions = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Auditor',
  'P.R.O.',
  'Business Manager',
  '4th Year Representative',
  '3rd Year Representative',
  '2nd Year Representative'
]

// Fetch active elections
const fetchElections = async () => {
  try {
    loading.value = true
    
    // Fetch all elections using the store
    const { data, error } = await electionStore.fetchElections()
    
    if (error) throw error
    
    // Filter for active elections (you can adjust this logic based on your needs)
    const now = new Date()
    elections.value = (data || []).filter(election => {
      const start = new Date(election.start_date)
      const end = new Date(election.end_date)
      return start <= now && now <= end
    })
    
    if (elections.value.length === 0) {
      error.value = 'There are no active elections at this time.'
      return
    }
    
    // If electionId is provided in route, ensure it exists in the list
    if (electionId.value) {
      const electionExists = elections.value.some(e => e.id === electionId.value)
      if (!electionExists) {
        error.value = 'The specified election was not found or is not active.'
        return
      }
      selectedElection.value = electionId.value
    } else {
      // Auto-select the first active election if none is selected
      selectedElection.value = elections.value[0].id
    }
    
  } catch (err) {
    console.error('Error fetching elections:', err)
    error.value = 'Failed to load election data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Validate form
const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.position) {
    errors.value.position = 'Position is required'
    isValid = false
  }

  if (!form.value.platform?.trim()) {
    errors.value.platform = 'Platform is required'
    isValid = false
  }

  if (form.value.platform.length < 50) {
    errors.value.platform = 'Platform must be at least 50 characters'
    isValid = false
  }
  
  return isValid
}

// Handle form submission
const submitApplication = async () => {
  if (!validateForm()) return
  
  try {
    submitting.value = true
    
    const { data, error } = await candidacyStore.submitApplication(
      selectedElection.value,
      form.value.position,
      form.value.platform
    )
    
    if (error) throw error
    
    // Show success message
    useToast().add({
      severity: 'success',
      summary: 'Application Submitted',
      detail: 'Your candidacy application has been submitted for review.',
      life: 5000
    })
    
    // Redirect to candidacy page
    navigateTo('/candidacy')
    
  } catch (err) {
    console.error('Error submitting application:', err)
    error.value = err.message || 'Failed to submit application. Please try again.'
  } finally {
    submitting.value = false
  }
}

// Fetch elections on component mount
onMounted(() => {
  fetchElections()
  loadPositions()
})
</script>