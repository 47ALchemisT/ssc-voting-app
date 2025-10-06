<template>
  <div>
    <AppBreadCrumbs :home="home" :items="items" />
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-xl font-medium text-gray-800">Profile Information</h1>
            <p class="text-sm text-gray-500">View and edit your profile information</p>
        </div>
      <Button
        v-if="!editMode"
        @click="editMode = true"
        size="small"
        icon="pi pi-pencil"
        label="Edit Profile"
      />
    </div>
    
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div v-if="authStore.loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      </div>

      <div v-else class="flex flex-col md:flex-row gap-8">
        <!-- Profile Picture Section -->
        <div class="md:w-1/3 flex flex-col items-center">
          <div class="relative w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            <img
              v-if="authStore.profile?.avatar_url"
              :src="authStore.profile.avatar_url"
              alt="Profile avatar"
              class="w-full h-full object-cover"
            />
            <div v-else class="text-6xl text-gray-400">
              {{ getInitials }}
            </div>
            <div
              v-if="editMode"
              class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <label class="cursor-pointer p-2 bg-white rounded-full flex items-center gap-2">
                <i v-if="!uploadingAvatar" class="pi pi-camera text-gray-700"></i>
                <i v-else class="pi pi-spin pi-spinner text-gray-700"></i>
                <input type="file" class="hidden" accept="image/*" @change="onAvatarSelected" />
              </label>
            </div>
          </div>
          <div v-if="editMode" class="mt-4 text-center">
            <p class="text-sm text-gray-500 mb-2">Click on the avatar to upload a new photo</p>
            <p class="text-xs text-gray-400">JPG, GIF or PNG. Max size of 2MB</p>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="md:w-2/3">
          <form v-if="editMode" @submit.prevent="saveProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <InputText
              v-model="form.first_name"
              type="text"
              size="small"
              class="w-full capitalize px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
            <InputText
              v-model="form.middle_name"
              type="text"
              size="small"
              class="w-full capitalize px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <InputText
              v-model="form.last_name"
              type="text"
              size="small"
              class="w-full capitalize px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">School Number</label>
            <InputText
              v-model="form.school_number"
              type="text"
              inputmode="numeric"
              size="small"
              pattern="[0-9]*"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              @input="form.school_number = $event.target.value.replace(/\D/g, '')"
            />
          </div>
          
          <!-- College Selection -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">College</label>
            <Dropdown
              v-model="form.college_id"
              :options="colleges"
              optionLabel="college_name"
              optionValue="id"
              placeholder="Select College"
              :loading="loadingColleges"
              class="w-full"
              :class="{ 'opacity-50': loadingColleges }"
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
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <InputText
              :value="authStore.user?.email"
              type="email"
              size="small"
              disabled
              class="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            @click="resetForm"
            size="small"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            :disabled="authStore.loading"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            :loading="authStore.loading"
            :disabled="authStore.loading"
          >
            Save Changes
          </Button>
        </div>
      </form>
          
          <!-- View Mode -->
          <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">First Name</p>
                <p class="capitalize text-gray-900 font-medium">{{ form.first_name || 'Not set' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Middle Name</p>
                <p class="capitalize text-gray-900 font-medium">{{ form.middle_name || 'Not set' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Last Name</p>
                <p class="capitalize text-gray-900 font-medium">{{ form.last_name || 'Not set' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">School Number</p>
                <p class="text-gray-900 font-medium">{{ form.school_number || 'Not set' }}</p>
              </div>
              
              <div class="md:col-span-2">
                <p class="text-sm text-gray-500">College</p>
                <p class="text-gray-900 font-medium">
                  {{ form.college_id ? getCollegeName(form.college_id) : 'Not set' }}
                </p>
              </div>
              
              <div class="md:col-span-2">
                <p class="text-sm text-gray-500">Email</p>
                <p class="text-gray-900 font-medium">{{ authStore.user?.email || 'Not set' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useAuthStore } from '../../../stores/auth'
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
    { label: 'Profile', icon: 'pi pi-user' },
]);

const authStore = useAuthStore()
const toast = useToast()

const editMode = ref(false)
const colleges = ref([])
const loadingColleges = ref(false)

// Fetch colleges on component mount
onMounted(async () => {
  loadingColleges.value = true
  const { data, error } = await authStore.fetchColleges()
  if (!error && data) {
    colleges.value = data
  }
  loadingColleges.value = false
})

const form = ref({
  first_name: authStore.profile?.first_name || '',
  last_name: authStore.profile?.last_name || '',
  middle_name: authStore.profile?.middle_name || '',
  school_number: authStore.profile?.school_number || '',
  college_id: authStore.profile?.college_id || null
})

onMounted(() => {
  if (authStore.profile) {
    Object.assign(form.value, authStore.profile)
  }
})

// Watch for profile changes
watch(() => authStore.profile, (newProfile) => {
  if (newProfile) {
    Object.assign(form.value, newProfile)
  }
}, { immediate: true })

// Get user initials for profile picture
const getInitials = computed(() => {
  const firstName = authStore.profile?.first_name?.[0] || ''
  const lastName = authStore.profile?.last_name?.[0] || ''
  return `${firstName}${lastName}`.toUpperCase()
})

// Get college name by ID
const getCollegeName = (collegeId) => {
  const college = colleges.value.find(c => c.id === collegeId)
  return college ? college.college_name : 'No college selected'
}

// Avatar upload handling
const uploadingAvatar = ref(false)
const onAvatarSelected = async (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return

  // Basic validation: type and size (max ~2MB)
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Invalid file', description: 'Please select an image file.', color: 'red' })
    return
  }
  const maxBytes = 2 * 1024 * 1024
  if (file.size > maxBytes) {
    toast.add({ title: 'File too large', description: 'Image must be under 2MB.', color: 'red' })
    return
  }

  try {
    uploadingAvatar.value = true
    const { error } = await authStore.uploadAvatar(file)
    if (error) throw error

    // Success feedback
    toast.add({ title: 'Avatar Updated', description: 'Your profile photo was updated successfully.', color: 'green' })
  } catch (err) {
    console.error('Avatar upload failed:', err)
    toast.add({ title: 'Upload failed', description: err.message || 'Could not upload avatar.', color: 'red' })
  } finally {
    uploadingAvatar.value = false
    // Clear the input value so selecting the same file again still triggers change
    if (event?.target) event.target.value = ''
  }
}

// Reset form to original values and exit edit mode
const resetForm = () => {
  if (authStore.profile) {
    Object.assign(form.value, authStore.profile)
  }
  editMode.value = false
}

// Save profile
const saveProfile = async () => {
  try {
    const { error } = await authStore.updateProfile({
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      middle_name: form.value.middle_name,
      school_number: form.value.school_number ? form.value.school_number.toString() : '',
      college_id: form.value.college_id
    })

    if (error) throw error
    
    toast.add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'green'
    })
    editMode.value = false // Exit edit mode on successful save
  } catch (error) {
    console.error('Error saving profile:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update profile',
      color: 'red'
    })
  }
}
</script>