<template>
    <!-- Confirmation Dialogs -->
    <Dialog v-model:visible="showApproveDialog" modal header="Confirm Approval" :style="{ width: '450px' }" :closable="false">
      <div class="flex flex-col items-center">
        <i class="pi pi-check-circle text-5xl text-green-500 mb-4"></i>
        <p class="text-center mb-6">Are you sure you want to approve this application?</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" size="small" severity="secondary" @click="showApproveDialog = false" :disabled="updating" />
          <Button label="Approve" size="small" @click="confirmUpdateStatus(1)" :loading="updating" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="showRejectDialog" modal header="Confirm Rejection" :style="{ width: '450px' }" :closable="false">
      <div class="flex flex-col items-center">
        <i class="pi pi-times-circle text-5xl text-red-500 mb-4"></i>
        <p class="text-center mb-6">Are you sure you want to reject this application?</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" size="small" @click="showRejectDialog = false" :disabled="updating" />
          <Button label="Reject" severity="danger" size="small" @click="confirmUpdateStatus(2)" :loading="updating" />
        </div>
      </template>
    </Dialog>

    <div class="mb-6">
        <div class="flex justify-between mb-3">
            <div>
                <h1 class="text-lg font-medium text-gray-800">Applicant Information</h1>
                <p v-if="application" class="text-gray-500 text-sm">Application was submitted on: {{ formatDate(application.created_at) }}</p>
                <p v-else class="text-gray-500 text-sm">Loading application details...</p>
            </div>
            <div>
                <Button 
                label="Back to Applications" 
                outline
                size="small"
                @click="navigateBack" 
                class="mb-4"
            />
            </div>
        </div>

      
      <div v-if="loading" class="text-center p-8">
        <ProgressSpinner />
        <p class="mt-2 text-gray-600">Loading application details...</p>
      </div>

      <div v-else-if="error" class="p-error">
        {{ error }}
      </div>

      <div v-else-if="application" class="mx-auto bg-white rounded-lg border border-gray-200 p-6">
        <div v-if="!loading" class="grid grid-cols-3 gap-6">
          <!-- Left Column -->
          <div class="col-span-1">
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <Avatar 
                :image="application.user?.avatar_url || 'https://via.placeholder.com/150'" 
                :label="application.user?.first_name ? application.user.first_name[0] + (application.user.last_name ? application.user.last_name[0] : '') : '?'" 
                size="xlarge" 
                shape="circle" 
                class="mx-auto mb-4 w-32 h-32 text-4xl"
              />
              <h2 class="text-xl font-semibold">{{ application.user?.first_name }} {{ application.user?.last_name }}</h2>
              <p class="text-gray-500 text-sm">{{ application.user?.email }}</p>
              
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Status:</span>
                  <Tag 
                    :value="getStatusLabel(application.status)" 
                    :severity="getStatusSeverity(application.status)" 
                    class="text-xs"
                  />
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Position:</span>
                  <span class="font-medium">{{ application.position?.title || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="text-sm font-medium text-gray-500 mb-4">ADMIN ACTIONS</h4>
                <div class="flex gap-3">
                    <Button 
                        v-if="application.status === 0"
                        label="Reject"
                        severity="secondary"
                        :loading="updating"
                        @click="showRejectDialog = true"
                        class="flex-1"
                    />
                    <Button 
                        v-if="application.status === 0"
                        label="Approve"
                        :loading="updating"
                        @click="showApproveDialog = true"
                        class="flex-1"
                    />
                    <Button 
                        v-if="application.status !== 0"
                        icon="pi pi-undo" 
                        label="Reset to Pending"
                        severity="secondary"
                        outlined
                        :loading="updating"
                        @click="updateStatus(0)"
                        class="flex-1"
                    />
                </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-span-2">
            <div class="bg-white p-6 rounded-lg border border-gray-200 h-full">
              <h3 class="text-lg font-semibold mb-4">Application Details</h3>
              
              <div class="space-y-6">
                <div>
                  <h4 class="text-sm font-medium text-gray-500 mb-2">PLATFORM</h4>
                  <div class="bg-gray-50 p-4 rounded border border-gray-200 min-h-[150px]">
                    {{ application.platform || 'No platform information provided' }}
                  </div>
                </div>
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-2">REQUIREMENTS</h4>
                    <div class="bg-gray-50 p-4 rounded border border-gray-200 ">
                        <p class="text-gray-500 text-center">Coming Soon</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCandidacyApplicationStore } from '../../../../stores/candidacy_application'
import { useAuth } from '../../../../composables/useAuth'

definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const applicationId = route.params.id
const loading = ref(true)
const error = ref(null)
const application = ref(null)
const updating = ref(false)
const isAdmin = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)

const candidacyStore = useCandidacyApplicationStore()

// Status constants for reference
const STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
}

const getStatusLabel = (status) => {
  switch (status) {
    case STATUS.APPROVED: return 'Approved'
    case STATUS.REJECTED: return 'Rejected'
    default: return 'Under Evaluation'
  }
}

const getStatusSeverity = (status) => {
  switch (status) {
    case STATUS.APPROVED: return 'success'
    case STATUS.REJECTED: return 'danger'
    default: return 'warning'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const navigateBack = () => {
  router.go(-1)
}

const confirmUpdateStatus = async (status) => {
  // Close both dialogs
  showApproveDialog.value = false
  showRejectDialog.value = false
  
  try {
    updating.value = true
    const store = useCandidacyApplicationStore()
    const { error: updateError } = await store.updateApplicationStatus(application.value.id, status)
    
    if (updateError) throw updateError
    
    // Update local state to reflect the change
    application.value.status = status
    
    // Show success message
    useToast().add({
      severity: 'success',
      summary: 'Success',
      detail: `Application ${status === 1 ? 'approved' : status === 2 ? 'rejected' : 'reset to pending'} successfully`,
      life: 3000
    })
  } catch (err) {
    console.error('Error updating application status:', err)
    error.value = err.message || 'Failed to update application status'
    
    useToast().add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 5000
    })
  } finally {
    updating.value = false
  }
}

const updateStatus = (status) => {
  if (status === 1) {
    showApproveDialog.value = true
  } else if (status === 2) {
    showRejectDialog.value = true
  } else {
    // For reset to pending, no confirmation needed
    confirmUpdateStatus(status)
  }
}

// Fetch application details
onMounted(async () => {
  if (!applicationId) {
    error.value = 'No application ID provided'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const { data, error: fetchError } = await candidacyStore.getApplicationById(applicationId)
    
    if (fetchError) throw fetchError
    
    application.value = data
  } catch (err) {
    console.error('Error fetching application:', err)
    error.value = err.message || 'Failed to load application details'
  } finally {
    loading.value = false
  }
})
</script>
