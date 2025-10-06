<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :closable="false"
    :dismissableMask="false"
    :modal="true"
    class="w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2"
  >
    <template #header>
      <div class="flex flex-col w-full">
        <div class="flex items-center gap-2 mb-2">
          <h2 class="text-xl font-semibold">Complete Your Profile</h2>
        </div>
        
        <!-- Stepper -->
        <div class="w-full mt-4">
          <div class="flex items-center">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="flex items-center flex-1 last:flex-none"
            >
              <!-- Step button -->
              <div class="flex flex-col items-center">
                <button 
                  class="bg-transparent border-0 p-0 flex flex-col items-center"
                  @click="goToStep(index)"
                  :disabled="index > activeStep"
                >
                  <span
                    :class="[
                      'rounded-full w-10 h-10 flex items-center justify-center transition-colors border-2',
                      index < activeStep ? 'bg-blue-500 text-white border-blue-500' : 
                      index === activeStep ? 'border-blue-500 bg-white text-blue-500' : 
                      'border-gray-200 bg-white text-gray-400'
                    ]"
                  >
                    <i :class="step.icon"></i>
                  </span>
                  <span 
                    class="text-sm font-medium mt-2"
                    :class="{
                      'text-blue-600': index <= activeStep,
                      'text-gray-500': index > activeStep
                    }"
                  >
                    {{ step.header }}
                  </span>
                </button>
              </div>
              
              <!-- Connector line -->
              <div 
                v-if="index < steps.length - 1"
                class="flex-1 h-[1px] mb-6 mx-2"
                :class="{
                  'bg-blue-500': index < activeStep,
                  'bg-gray-200': index >= activeStep
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Step 1: Welcome -->
    <div v-if="activeStep === 0" class="space-y-6 py-8 text-center">
      <div class="flex justify-center mb-6">
        <div class="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
          <i class="pi pi-user-plus text-4xl text-blue-500"></i>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Welcome to SSC Voting App!</h2>
      <div class="max-w-2xl mx-auto text-gray-600 space-y-4">
        <p>We're excited to have you on board! Before you get started, we need a few details to set up your account.</p>
        <p>This will only take a minute and will help us personalize your experience.</p>
      </div>
    </div>

    <!-- Step 2: Personal Information -->
    <div v-else-if="activeStep === 1" class="space-y-6 py-8">
      <div class="mb-4 text-gray-600">
        <h3 class="text-lg font-medium mb-2">Personal Information</h3>
        <p class="text-sm text-gray-500">Please provide your personal details.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <InputText
            v-model="form.first_name"
            type="text"
            class="w-full"
            :class="{ 'p-invalid': !form.first_name && submitted }"
            placeholder="Enter your first name"
          />
          <small v-if="!form.first_name && submitted" class="p-error">First name is required</small>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
          <InputText 
            v-model="form.middle_name" 
            type="text" 
            class="w-full" 
            placeholder="Enter your middle name (optional)" 
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <InputText
            v-model="form.last_name"
            type="text"
            class="w-full"
            :class="{ 'p-invalid': !form.last_name && submitted }"
            placeholder="Enter your last name"
          />
          <small v-if="!form.last_name && submitted" class="p-error">Last name is required</small>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">School Number *</label>
          <InputText
            v-model="form.school_number"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="w-full"
            :class="{ 'p-invalid': !form.school_number && submitted }"
            @input="form.school_number = $event.target.value.replace(/\D/g, '')"
            placeholder="Enter your school number"
          />
          <small v-if="!form.school_number && submitted" class="p-error">School number is required</small>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">College *</label>
          <Dropdown
            v-model="form.college_id"
            :options="colleges"
            optionLabel="college_name"
            optionValue="id"
            placeholder="Select your college"
            class="w-full"
            :class="{ 'p-invalid': !form.college_id && submitted }"
            :loading="loadingColleges"
            :disabled="loadingColleges"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <span>{{ getCollegeName(slotProps.value) }}</span>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
          <small v-if="!form.college_id && submitted" class="p-error">College is required</small>
        </div>
      </div>
    </div>
    
    <!-- Step 3: Profile Picture -->
    <div v-else-if="activeStep === 2" class="space-y-6 py-8">
      <div class="mb-4">
        <h3 class="text-lg font-medium mb-2">Profile Picture</h3>
        <p class="text-sm text-gray-500">Upload a clear photo of yourself (optional but recommended).</p>
      </div>

      <div class="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div class="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 mb-4">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Profile preview"
            class="w-full h-full object-cover"
          />
          <i v-else class="pi pi-user text-4xl text-gray-400"></i>
        </div>
        
        <div class="text-center">
          <label class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
            <i class="pi pi-upload mr-2"></i>
            {{ avatarFile ? 'Change Photo' : 'Upload Photo' }}
            <input type="file" class="hidden" accept="image/*" @change="onAvatarSelected" />
          </label>
          <p class="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB</p>
          
          <Button 
            v-if="avatarPreview"
            label="Remove" 
            icon="pi pi-times" 
            text 
            severity="danger" 
            size="small" 
            class="mt-2"
            @click="removeAvatar"
          />
        </div>
      </div>
    </div>

    <!-- Step 4: Review -->
    <div v-else-if="activeStep === 3" class="space-y-6 py-8">
      <div class="mb-4">
        <h3 class="text-lg font-medium mb-2">Review Your Information</h3>
        <p class="text-sm text-gray-500">Please review your information before submitting.</p>
      </div>

      <div class="bg-gray-50 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Personal Information</h4>
            <div class="space-y-2">
              <div>
                <p class="text-sm text-gray-500">Full Name</p>
                <p class="font-medium">{{ form.first_name }} {{ form.middle_name ? form.middle_name + ' ' : '' }}{{ form.last_name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">School Number</p>
                <p class="font-medium">{{ form.school_number || 'Not provided' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">College</p>
                <p class="font-medium">{{ form.college_id ? getCollegeName(form.college_id) : 'Not provided' }}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Profile Picture</h4>
            <div class="flex items-center">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 mr-4">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Profile preview"
                  class="w-full h-full object-cover"
                />
                <i v-else class="pi pi-user text-2xl text-gray-400"></i>
              </div>
              <p class="text-sm text-gray-600">{{ avatarFile ? 'Photo ready to upload' : 'No photo selected' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-between items-center">
        <Button 
          v-if="activeStep > 0" 
          label="Back" 
          icon="pi pi-arrow-left" 
          text
          @click="previousStep"
        />
        
        <div class="flex gap-2">
          <Button 
            v-if="activeStep < steps.length - 1" 
            :label="activeStep === 0 ? 'Continue' : 'Next'"
            icon="pi pi-arrow-right"
            icon-pos="right"
            @click="nextStep"
          />
          <Button 
            v-else
            label="Save Profile"
            icon="pi pi-check"
            :loading="loading"
            @click="saveProfile"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({
      first_name: '',
      last_name: '',
      middle_name: '',
      school_number: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const authStore = useAuthStore()
const loading = ref(false)
const submitted = ref(false)
const activeStep = ref(0)
const colleges = ref([])
const loadingColleges = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref(null)

// Stepper configuration
const steps = [
  { header: 'Welcome', icon: 'pi pi-info-circle' },
  { header: 'Personal Info', icon: 'pi pi-user' },
  { header: 'Profile Photo', icon: 'pi pi-camera' },
  { header: 'Review', icon: 'pi pi-check-circle' }
]

const form = ref({
  first_name: props.initialData.first_name || '',
  last_name: props.initialData.last_name || '',
  middle_name: props.initialData.middle_name || '',
  school_number: props.initialData.school_number || '',
  college_id: props.initialData.college_id || null
})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Navigation methods
const goToStep = (stepIndex) => {
  // Don't allow going to steps beyond the current active step
  if (stepIndex > activeStep.value) return
  
  // If going to step 1 (index 0), validate the form first
  if (stepIndex === 0) {
    activeStep.value = stepIndex
    return
  }
  
  // If going to step 2 (index 1), no validation needed
  if (stepIndex === 1) {
    activeStep.value = stepIndex
    return
  }
}

const nextStep = () => {
  // For the welcome step, just move to the next step without validation
  if (activeStep.value === 0) {
    activeStep.value++
    return
  }
  
  // For personal info step (step 1), validate the form
  if (activeStep.value === 1) {
    submitted.value = true
    if (!form.value.first_name || !form.value.last_name || !form.value.school_number || !form.value.college_id) {
      return
    }
  }
  
  // For other steps, just proceed
  if (activeStep.value < steps.length - 1) {
    activeStep.value++
  }
}

const previousStep = () => {
  activeStep.value--
}

// Reset form when modal is opened
const resetForm = () => {
  form.value = {
    first_name: props.initialData.first_name || '',
    last_name: props.initialData.last_name || '',
    middle_name: props.initialData.middle_name || '',
    school_number: props.initialData.school_number || '',
    college_id: props.initialData.college_id || null
  }
  avatarFile.value = null
  avatarPreview.value = null
  submitted.value = false
  activeStep.value = 0
}

// Watch for modal open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const onAvatarSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Check file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    useToast().add({
      severity: 'error',
      summary: 'Error',
      detail: 'File size should not exceed 2MB',
      life: 3000
    })
    return
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    useToast().add({
      severity: 'error',
      summary: 'Error',
      detail: 'Only JPG, PNG, and GIF files are allowed',
      life: 3000
    })
    return
  }
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  avatarFile.value = file
}

const removeAvatar = () => {
  avatarFile.value = null
  avatarPreview.value = null
}

const saveProfile = async () => {
  submitted.value = true
  
  // Validate required fields
  if (!form.value.first_name || !form.value.last_name || !form.value.school_number) {
    // Go back to first step if validation fails
    activeStep.value = 0
    return
  }
  
  try {
    loading.value = true
    
    // First upload avatar if selected
    if (avatarFile.value) {
      await authStore.uploadAvatar(avatarFile.value)
    }
    
    // Update profile
    const { error } = await authStore.updateProfile({
      first_name: form.value.first_name.trim(),
      last_name: form.value.last_name.trim(),
      middle_name: form.value.middle_name.trim(),
      school_number: form.value.school_number.trim(),
      college_id: form.value.college_id
    })
    
    if (error) throw error
    
    // Close modal and notify parent
    visible.value = false
    emit('saved')
    
    useToast().add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile completed successfully!',
      life: 3000
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    useToast().add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save profile. Please try again.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Fetch colleges on mount
const fetchColleges = async () => {
  try {
    loadingColleges.value = true
    const { data, error } = await authStore.fetchColleges()
    if (!error && data) {
      colleges.value = data
    }
  } catch (error) {
    console.error('Error fetching colleges:', error)
  } finally {
    loadingColleges.value = false
  }
}

// Get college name by ID
const getCollegeName = (collegeId) => {
  const college = colleges.value.find(c => c.id === collegeId)
  return college ? college.college_name : 'Not selected'
}

// Initialize with existing data
onMounted(async () => {
  if (props.initialData.avatar_url) {
    avatarPreview.value = props.initialData.avatar_url
  }
  await fetchColleges()
})
</script>
