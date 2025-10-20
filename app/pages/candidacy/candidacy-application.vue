<template>
  <div>
    <AppBreadCrumbs :home="home" :items="items" />
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

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 gap-6">
            <!-- Election Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Election</label>
              <Dropdown
                v-model="form.electionId"
                :options="electionStore.elections"
                option-label="title"
                option-value="id"
                placeholder="Select an election"
                class="w-full"
                :class="{ 'p-invalid': errors.electionId }"
                :disabled="!!electionId"
              />
              <small v-if="errors.electionId" class="p-error">{{ errors.electionId }}</small>
            </div>

            <!-- Position Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <Dropdown
                v-model="form.positionId"
                :options="positionStore.positions || []"
                option-label="title"
                option-value="id"
                placeholder="Select a position"
                class="w-full"
                :class="{ 'p-invalid': errors.positionId }"
                :loading="positionStore.loading"
                :disabled="positionStore.loading"
              />
              <small v-if="errors.positionId" class="p-error">{{ errors.positionId }}</small>
            </div>

            <!-- Partylist Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Partylist</label>
              <Dropdown
                v-model="form.partylistId"
                :options="[{ id: null, name: 'Independent' }, ...(partylistStore.partylists || [])]"
                option-label="name"
                option-value="id"
                placeholder="Select a partylist"
                class="w-full"
                :class="{ 'p-invalid': errors.partylistId }"
                :loading="partylistStore.loading"
                :disabled="partylistStore.loading"
              />
              <small v-if="errors.partylistId" class="p-error">{{ errors.partylistId }}</small>
            </div>

            <!-- Platform -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Your Platform</label>
              <Textarea
                v-model="form.platform"
                rows="5"
                class="w-full"
                :class="{ 'p-invalid': errors.platform }"
                placeholder="Share your platform and reasons for running..."
              />
              <small v-if="errors.platform" class="p-error">{{ errors.platform }}</small>
            </div>

            <!-- Document Uploads -->
            <div class="space-y-6">
              <h3 class="text-sm font-medium text-gray-700">Required Documents</h3>
              
              <!-- Grade Slip -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Grade Slip (PDF/Image) <span class="text-red-500">*</span>
                </label>
                <div v-if="filePreviews.gradeSlip" class="mt-2">
                  <div class="flex items-center justify-between p-2 border border-blue-400 bg-blue-50 rounded">
                    <div class="flex items-center space-x-2">
                      <img v-if="filePreviews.gradeSlip.startsWith('data:image')" 
                           :src="filePreviews.gradeSlip" 
                           class="h-10 w-10 object-cover rounded" 
                           alt="Grade slip preview" />
                      <img v-else :src="filePreviews.gradeSlip" class="h-10 w-10" alt="File icon" />
                      <span class="text-sm text-gray-700 truncate max-w-xs">{{ form.gradeSlip?.name }}</span>
                    </div>
                    <Button 
                      type="button" 
                      icon="pi pi-times" 
                      class="p-button-text p-button-rounded p-button-danger"
                      @click="removeFile('gradeSlip')"
                      v-tooltip.top="'Remove file'"
                    />
                  </div>
                </div>
                <FileUpload
                  v-else
                  mode="basic"
                  :auto="true"
                  :multiple="false"
                  :maxFileSize="5000000"
                  accept=".pdf,.jpg,.jpeg,.png"
                  chooseLabel="Upload Grade Slip"
                  @select="(e) => handleFileSelect(e, 'gradeSlip')"
                  :class="{ 'p-invalid': errors.gradeSlip }"
                />
                <small class="text-gray-500 text-xs">Upload your latest grade slip (Max 5MB, PDF or Image)</small>
                <small v-if="errors.gradeSlip" class="p-error block">{{ errors.gradeSlip }}</small>
              </div>

              <!-- Activity Certificate -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Activity Certificate (PDF/Image) <span class="text-red-500">*</span>
                </label>
                <div v-if="filePreviews.activityCertificate" class="mt-2">
                  <div class="flex items-center justify-between p-2 border border-blue-400 bg-blue-50 rounded">
                    <div class="flex items-center space-x-2">
                      <img v-if="filePreviews.activityCertificate.startsWith('data:image')" 
                           :src="filePreviews.activityCertificate" 
                           class="h-10 w-10 object-cover rounded" 
                           alt="Activity certificate preview" />
                      <img v-else :src="filePreviews.activityCertificate" class="h-10 w-10" alt="File icon" />
                      <span class="text-sm text-gray-700 truncate max-w-xs">{{ form.activityCertificate?.name }}</span>
                    </div>
                    <Button 
                      type="button" 
                      icon="pi pi-times" 
                      class="p-button-text p-button-rounded p-button-danger"
                      @click="removeFile('activityCertificate')"
                      v-tooltip.top="'Remove file'"
                    />
                  </div>
                </div>
                <FileUpload
                  v-else
                  mode="basic"
                  :auto="true"
                  :multiple="false"
                  :maxFileSize="5000000"
                  accept=".pdf,.jpg,.jpeg,.png"
                  chooseLabel="Upload Activity Certificate"
                  @select="(e) => handleFileSelect(e, 'activityCertificate')"
                  :class="{ 'p-invalid': errors.activityCertificate }"
                />
                <small class="text-gray-500 text-xs">Upload your activity certificate (Max 5MB, PDF or Image)</small>
                <small v-if="errors.activityCertificate" class="p-error block">{{ errors.activityCertificate }}</small>
              </div>

              <!-- Candidacy Certificate -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Certificate of Candidacy (PDF/Image) <span class="text-red-500">*</span>
                </label>
                <div v-if="filePreviews.candidacyCertificate" class="mt-2">
                  <div class="flex items-center justify-between p-2  border border-blue-400 bg-blue-50 rounded">
                    <div class="flex items-center space-x-2">
                      <img v-if="filePreviews.candidacyCertificate.startsWith('data:image')" 
                           :src="filePreviews.candidacyCertificate" 
                           class="h-10 w-10 object-cover rounded" 
                           alt="Candidacy certificate preview" />
                      <img v-else :src="filePreviews.candidacyCertificate" class="h-10 w-10" alt="File icon" />
                      <span class="text-sm text-gray-700 truncate max-w-xs">{{ form.candidacyCertificate?.name }}</span>
                    </div>
                    <Button 
                      type="button" 
                      icon="pi pi-times" 
                      class="p-button-text p-button-rounded p-button-danger"
                      @click="removeFile('candidacyCertificate')"
                      v-tooltip.top="'Remove file'"
                    />
                  </div>
                </div>
                <FileUpload
                  v-else
                  mode="basic"
                  :auto="true"
                  :multiple="false"
                  :maxFileSize="5000000"
                  accept=".pdf,.jpg,.jpeg,.png"
                  chooseLabel="Upload Candidacy Certificate"
                  @select="(e) => handleFileSelect(e, 'candidacyCertificate')"
                  :class="{ 'p-invalid': errors.candidacyCertificate }"
                />
                <small class="text-gray-500 text-xs">Upload your certificate of candidacy (Max 5MB, PDF or Image)</small>
                <small v-if="errors.candidacyCertificate" class="p-error block">{{ errors.candidacyCertificate }}</small>
              </div>

              <!-- Back Subject Record -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Back Subject Record (PDF/Image, if applicable)
                </label>
                <div v-if="filePreviews.backSubjectRecord" class="mt-2">
                  <div class="flex items-center justify-between p-2 border border-blue-400 bg-blue-50 rounded">
                    <div class="flex items-center space-x-2">
                      <img v-if="filePreviews.backSubjectRecord.startsWith('data:image')" 
                           :src="filePreviews.backSubjectRecord" 
                           class="h-10 w-10 object-cover rounded" 
                           alt="Back subject record preview" />
                      <img v-else :src="filePreviews.backSubjectRecord" class="h-10 w-10" alt="File icon" />
                      <span class="text-sm text-gray-700 truncate max-w-xs">{{ form.backSubjectRecord?.name }}</span>
                    </div>
                    <Button 
                      type="button" 
                      icon="pi pi-times" 
                      class="p-button-text p-button-rounded p-button-danger"
                      @click="removeFile('backSubjectRecord')"
                      v-tooltip.top="'Remove file'"
                    />
                  </div>
                </div>
                <FileUpload
                  v-else
                  mode="basic"
                  :auto="true"
                  :multiple="false"
                  :maxFileSize="5000000"
                  accept=".pdf,.jpg,.jpeg,.png"
                  chooseLabel="Upload Back Subject Record"
                  @select="(e) => handleFileSelect(e, 'backSubjectRecord')"
                />
                <small class="text-gray-500 text-xs">Upload your back subject record if applicable (Max 5MB, PDF or Image)</small>
              </div>

              <!-- COR (Certificate of Registration) -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Certificate of Registration (PDF/Image) <span class="text-red-500">*</span>
                </label>
                <div v-if="filePreviews.cor" class="mt-2">
                  <div class="flex items-center justify-between p-2 border border-blue-400 bg-blue-50 rounded">
                    <div class="flex items-center space-x-2">
                      <img v-if="filePreviews.cor.startsWith('data:image')" 
                           :src="filePreviews.cor" 
                           class="h-10 w-10 object-cover rounded" 
                           alt="COR preview" />
                      <img v-else :src="filePreviews.cor" class="h-10 w-10" alt="File icon" />
                      <span class="text-sm text-gray-700 truncate max-w-xs">{{ form.cor?.name }}</span>
                    </div>
                    <Button 
                      type="button" 
                      icon="pi pi-times" 
                      class="p-button-text p-button-rounded p-button-danger"
                      @click="removeFile('cor')"
                      v-tooltip.top="'Remove file'"
                    />
                  </div>
                </div>
                <FileUpload
                  v-else
                  mode="basic"
                  :auto="true"
                  :multiple="false"
                  :maxFileSize="5000000"
                  accept=".pdf,.jpg,.jpeg,.png"
                  chooseLabel="Upload COR"
                  @select="(e) => handleFileSelect(e, 'cor')"
                  :class="{ 'p-invalid': errors.cor }"
                />
                <small class="text-gray-500 text-xs">Upload your certificate of registration (Max 5MB, PDF or Image)</small>
                <small v-if="errors.cor" class="p-error block">{{ errors.cor }}</small>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="$router.back()"
                :disabled="submitting"
              />
              <Button
                type="submit"
                label="Submit Application"
                :loading="submitting"
                :disabled="submitting"
              />
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Dialog -->
    <Dialog
      v-model:visible="showSuccessModal"
      modal
      header="Application Submitted"
      :style="{ width: '28rem' }"
    >
      <div class="flex items-start">
        <i class="pi pi-check-circle text-emerald-500 text-2xl mr-3"></i>
        <div>
          <p class="text-sm text-gray-700">Your candidacy application has been submitted for review. You will be notified once it has been processed.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <Button
            type="button"
            label="Close"
            class="p-button-text"
            @click="onSuccessConfirm"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePartylistsStore } from '../../../stores/partylists'
import { navigateTo } from '#imports'
import { useAuthStore } from '../../../stores/auth'
import { usePositionStore } from '../../../stores/positions'
import { useElectionStore } from '../../../stores/elections'
import { useCandidacyApplicationStore } from '../../../stores/candidacy_application'
import { useToast } from 'primevue/usetoast'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'

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
    { label: 'Candidacy', icon: 'pi pi-list', route: '/candidacy' },
    { label: 'Candidacy Application', icon: 'pi pi-file-edit'},
]);

const route = useRoute()
const authStore = useAuthStore()
const positionStore = usePositionStore()
const electionStore = useElectionStore()
const partylistStore = usePartylistsStore()
const applicationStore = useCandidacyApplicationStore()
const toast = useToast()

// Expose the election store to the template
const elections = computed(() => electionStore.elections)

const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const showSuccessModal = ref(false)
const electionId = computed(() => route.query.election_id || null)

// Fetch active elections
const fetchElections = async () => {
  try {
    loading.value = true
    const { data, error: fetchError } = await electionStore.getCurrentElections()
    
    if (fetchError) throw new Error(fetchError)
    
    electionStore.elections = data || []
    
    // If there's an electionId in the URL, set it in the form
    if (electionId.value) {
      form.value.electionId = electionId.value
      await loadPositions()
    }
  } catch (err) {
    console.error('Error fetching elections:', err)
    error.value = 'Failed to load elections. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Load positions for the selected election
const loadPositions = async () => {
  try {
    const { data, error: posError } = await positionStore.getPositions()
    
    if (posError) throw new Error(posError)
    
    positionStore.positions = data || []
    form.value.positionId = null // Reset position selection
  } catch (err) {
    console.error('Error loading positions:', err)
  }
}

const form = ref({
  electionId: null,
  positionId: null,
  partylistId: null,
  platform: '',
  gradeSlip: null,
  activityCertificate: null,
  candidacyCertificate: null,
  backSubjectRecord: null,
  cor: null
})

const errors = ref({})

const filePreviews = ref({
  gradeSlip: null,
  activityCertificate: null,
  candidacyCertificate: null,
  backSubjectRecord: null,
  cor: null
})

const handleFileSelect = (event, field) => {
  if (event.files && event.files[0]) {
    const file = event.files[0]
    form.value[field] = file
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreviews.value[field] = e.target.result
      }
      reader.readAsDataURL(file)
    } else if (file.type === 'application/pdf') {
      filePreviews.value[field] = '/img/pdf-icon.png' // Path to a PDF icon
    } else {
      filePreviews.value[field] = '/img/file-icon.png' // Path to a generic file icon
    }
  }
}

const removeFile = (field) => {
  form.value[field] = null
  filePreviews.value[field] = null
}

const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.electionId) {
    newErrors.electionId = 'Please select an election'
  }
  
  if (!form.value.positionId) {
    newErrors.positionId = 'Please select a position'
  }
  
  if (!form.value.partylistId) {
    newErrors.partylistId = 'Please select a partylist'
  }
  
  if (!form.value.platform?.trim()) {
    newErrors.platform = 'Please provide your platform'
  }
  
  // Required documents validation
  if (!form.value.gradeSlip) {
    newErrors.gradeSlip = 'Grade slip is required'
  }
  
  if (!form.value.activityCertificate) {
    newErrors.activityCertificate = 'Activity certificate is required'
  }
  
  if (!form.value.candidacyCertificate) {
    newErrors.candidacyCertificate = 'Candidacy certificate is required'
  }
  
  if (!form.value.cor) {
    newErrors.cor = 'Certificate of Registration is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    submitting.value = true
    
    // Submit application with all form data
    const { data, error: submitError } = await applicationStore.submitApplication({
      ...form.value,
      electionId: form.value.electionId || electionId.value
    })
    
    if (submitError) throw new Error(submitError)
    
    // Show success modal
    showSuccessModal.value = true
    
    // Reset form
    form.value = {
      electionId: null,
      positionId: null,
      platform: '',
      gradeSlip: null,
      activityCertificate: null,
      candidacyCertificate: null,
      backSubjectRecord: null,
      cor: null
    }
    
  } catch (err) {
    console.error('Error submitting application:', err)
    toast.add({
      severity: 'error',
      summary: 'Submission Failed',
      detail: err.message || 'Failed to submit application. Please try again.',
      life: 5000
    })
  } finally {
    submitting.value = false
  }
}

const onSuccessConfirm = () => {
  showSuccessModal.value = false
  navigateTo('/dashboard')
}

onMounted(async () => {
  await fetchElections()
  await loadPositions()
  await partylistStore.fetchPartylists()
})
</script>